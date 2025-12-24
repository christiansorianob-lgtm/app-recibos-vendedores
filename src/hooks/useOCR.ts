import { useState } from 'react';
import { createWorker } from 'tesseract.js';

export interface ExtractedReceiptData {
    fecha?: string;
    kilogramos?: number;
    numeroTiquete?: string;
    valorUnitario?: number;
    empresaNombre?: string;
    rawText: string;
    confidence: number;
}

export function useOCR() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const autoCorrectImage = async (imageFile: File): Promise<File> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d')!;

                // 1. Redimensionar para un tamaño óptimo
                const targetWidth = 3000;
                const scale = targetWidth / img.width;
                canvas.width = targetWidth;
                canvas.height = img.height * scale;

                // 2. Grayscale inicial
                ctx.filter = 'grayscale(100%)';
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                const width = imageData.width;
                const height = imageData.height;

                // 3. Filtro de Enfoque (Strong Sharpen)
                const sharpenKernel = [
                    -1, -1, -1,
                    -1, 9, -1,
                    -1, -1, -1
                ];
                const sharpened = new Uint8ClampedArray(data.length);
                for (let y = 1; y < height - 1; y++) {
                    for (let x = 1; x < width - 1; x++) {
                        for (let c = 0; c < 3; c++) {
                            let sum = 0;
                            for (let ky = 0; ky < 3; ky++) {
                                for (let kx = 0; kx < 3; kx++) {
                                    const idx = ((y + ky - 1) * width + (x + kx - 1)) * 4 + c;
                                    sum += data[idx] * sharpenKernel[ky * 3 + kx];
                                }
                            }
                            const outIdx = (y * width + x) * 4 + c;
                            sharpened[outIdx] = Math.min(255, Math.max(0, sum));
                        }
                        sharpened[(y * width + x) * 4 + 3] = 255;
                    }
                }

                // 4. Umbral Adaptativo (Bradley-Roth)
                // Ideal para recibos con sombras o iluminación irregular
                const S = Math.floor(width / 16);
                const T = 0.12;
                const integral = new Int32Array(width * height);
                for (let x = 0; x < width; x++) {
                    let sum = 0;
                    for (let y = 0; y < height; y++) {
                        const i = (y * width + x) * 4;
                        const b = (sharpened[i] + sharpened[i + 1] + sharpened[i + 2]) / 3;
                        sum += b;
                        if (x === 0) integral[y * width + x] = sum;
                        else integral[y * width + x] = integral[y * width + x - 1] + sum;
                    }
                }

                for (let x = 0; x < width; x++) {
                    for (let y = 0; y < height; y++) {
                        const x1 = Math.max(0, x - S / 2);
                        const x2 = Math.min(width - 1, x + S / 2);
                        const y1 = Math.max(0, y - S / 2);
                        const y2 = Math.min(height - 1, y + S / 2);
                        const count = (x2 - x1) * (y2 - y1);
                        const sum = integral[y2 * width + x2] - integral[y1 * width + x2] - integral[y2 * width + x1] + integral[y1 * width + x1];

                        const i = (y * width + x) * 4;
                        const b = (sharpened[i] + sharpened[i + 1] + sharpened[i + 2]) / 3;
                        const val = (b * count) < (sum * (1.0 - T)) ? 0 : 255;
                        sharpened[i] = sharpened[i + 1] = sharpened[i + 2] = val;
                    }
                }
                ctx.putImageData(new ImageData(sharpened, width, height), 0, 0);

                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(new File([blob], imageFile.name, { type: 'image/jpeg' }));
                    }
                }, 'image/jpeg', 0.9);
            };
            img.src = URL.createObjectURL(imageFile);
        });
    };

    const rotateImage = async (imageFile: File, degrees: number): Promise<File> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d')!;

                if (degrees === 90 || degrees === 270) {
                    canvas.width = img.height;
                    canvas.height = img.width;
                } else {
                    canvas.width = img.width;
                    canvas.height = img.height;
                }

                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate((degrees * Math.PI) / 180);
                ctx.drawImage(img, -img.width / 2, -img.height / 2);

                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(new File([blob], imageFile.name, { type: 'image/jpeg' }));
                    }
                }, 'image/jpeg', 0.95);
            };
            img.src = URL.createObjectURL(imageFile);
        });
    };

    const processImage = async (imageFile: File, options: { autoCorrect?: boolean } = {}): Promise<ExtractedReceiptData> => {
        setIsProcessing(true);
        setProgress(0);

        try {
            let processedFile = imageFile;
            if (options.autoCorrect) {
                setProgress(5);
                processedFile = await autoCorrectImage(imageFile);
            }

            const worker = await createWorker('eng+spa', 1, {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        setProgress(Math.round(m.progress * 80) + 20);
                    }
                },
            });

            // Configurar parámetros para máxima nitidez de texto pequeño
            await worker.setParameters({
                tessedit_pageseg_mode: '3',
                tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzáéíóúÁÉÍÓÚñÑ:.-/, $',
                preserve_interword_spaces: '1',
                tessjs_create_hocr: '0',
                tessjs_create_tsv: '0',
            });

            // Eliminamos worker.detect() para evitar el error de "Legacy Model"
            setProgress(15);

            const { data } = await worker.recognize(processedFile);
            await worker.terminate();

            const extractedData = parseReceiptText(data.text, data.confidence);

            setIsProcessing(false);
            return extractedData;
        } catch (error) {
            setIsProcessing(false);
            throw new Error('Error al procesar la imagen: ' + (error as Error).message);
        }
    };

    return {
        processImage,
        rotateImage,
        autoCorrectImage,
        isProcessing,
        progress,
    };
}

function parseReceiptText(text: string, confidence: number): ExtractedReceiptData {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

    let fecha: string | undefined;
    let kilogramos: number | undefined;
    let numeroTiquete: string | undefined;
    let valorUnitario: number | undefined;
    let empresaNombre: string | undefined;

    // 1. Buscar Nombre de Empresa (Oleoflores S.A.S)
    for (const line of lines) {
        if (line.toUpperCase().includes('OLEOFLORES')) {
            empresaNombre = 'Oleoflores';
            break;
        }
    }

    // 2. Buscar fecha (formatos: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD)
    const fechaRegex = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})|(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/;
    for (const line of lines) {
        const match = line.match(fechaRegex);
        if (match) {
            if (match[1]) {
                const day = match[1].padStart(2, '0');
                const month = match[2].padStart(2, '0');
                const year = match[3];
                fecha = `${year}-${month}-${day}`;
            } else if (match[4]) {
                fecha = `${match[4]}-${match[5].padStart(2, '0')}-${match[6].padStart(2, '0')}`;
            }
            break;
        }
    }

    // 3. Buscar número de tiquete (Prioridad: GUÍA TRANSPORTE VEHÍCULO)
    // El objetivo es el número de 10 dígitos (ej. 1000082175)

    const textNormal = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Intento 1: Buscar en el bloque de texto completo cerca de "GUIA" o "TRANSPORTE"
    // Buscamos cualquier número de 9-11 dígitos que esté después de la palabra clave
    // Agregamos variantes que el OCR suele confundir (cul - ae, gula, etc.)
    const guiaWords = ['guia', 'transp', 'vehi', 'gula', 'cuia', 'cul - ae', 'vehicu', 'ranspor', 'ansp'];

    for (const word of guiaWords) {
        const index = textNormal.indexOf(word);
        if (index !== -1) {
            const slice = textNormal.substring(index, index + 150);
            // Ignorar específicamente el bloque que contenga "CODIGO" o "NIT" si es posible
            const subSlice = slice.split('codigo')[0].split('nit')[0];
            const match = subSlice.match(/(\d{9,12})/);
            if (match) {
                numeroTiquete = match[1];
                break;
            }
        }
    }

    // Intento 2: Si no hay match con palabras clave, buscamos el número más largo del recibo (que no sea NIT)
    if (!numeroTiquete) {
        const allNumbers = text.match(/\d{5,15}/g); // Agarrar cualquier número de +5 dígitos
        if (allNumbers) {
            // Ordenar por longitud descendente para preferir el más largo (Guía de 10 vs Interno de 6)
            const sortedNumbers = [...allNumbers].sort((a, b) => b.length - a.length);
            for (const num of sortedNumbers) {
                const idx = text.indexOf(num);
                const context = text.substring(Math.max(0, idx - 40), idx + 10).toLowerCase();
                // Si el número tiene 10 dígitos y NO es NIT, es nuestra Guía
                if (num.length >= 9 && !context.includes('nit')) {
                    numeroTiquete = num;
                    break;
                }
            }
        }
    }

    // Intento 3: Si sigue vacío, buscar fallback específico de CODIGO INTERNO (Solo como último recurso)
    if (!numeroTiquete) {
        for (const line of lines) {
            const lowerLine = line.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (lowerLine.includes('codigo') || lowerLine.includes('interno')) {
                const match = line.match(/(\d{4,9})/);
                if (match) {
                    numeroTiquete = match[1];
                    break;
                }
            }
        }
    }

    // 4. Buscar peso/kilogramos (PESO NETO: 4.590 -> 4590)
    for (const line of lines) {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('peso neto') || lowerLine.includes('neto')) {
            const match = line.match(/(\d+[,.]\d{3})/); // Formato 1.234 o 1,234
            if (match) {
                // Eliminar el punto/coma de miles según el usuario "4.590 son 4590"
                kilogramos = parseInt(match[1].replace(/[,.]/g, ''));
                break;
            }
            const simpleMatch = line.match(/(\d+)/);
            if (simpleMatch) {
                kilogramos = parseInt(simpleMatch[1]);
                break;
            }
        }
    }

    // 5. Buscar valor unitario
    const valorRegex = /\$?\s*(\d+[,.]?\d*)\s*(COP)?/i;
    for (const line of lines) {
        if (line.toLowerCase().includes('valor') || line.toLowerCase().includes('precio')) {
            const match = line.match(valorRegex);
            if (match) {
                valorUnitario = parseFloat(match[1].replace(',', '.'));
                break;
            }
        }
    }

    return {
        fecha,
        kilogramos,
        numeroTiquete,
        valorUnitario,
        empresaNombre,
        rawText: text,
        confidence,
    };
}
