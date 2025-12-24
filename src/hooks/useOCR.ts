import { useState } from 'react';
import { createWorker } from 'tesseract.js';

export interface ExtractedReceiptData {
    fecha?: string;
    kilogramos?: number;
    numeroTiquete?: string;
    valorUnitario?: number;
    rawText: string;
    confidence: number;
}

export function useOCR() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const processImage = async (imageFile: File): Promise<ExtractedReceiptData> => {
        setIsProcessing(true);
        setProgress(0);

        try {
            const worker = await createWorker('spa', 1, {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        setProgress(Math.round(m.progress * 100));
                    }
                },
            });

            const { data } = await worker.recognize(imageFile);
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

    // Buscar fecha (formatos: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD)
    const fechaRegex = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})|(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/;
    for (const line of lines) {
        const match = line.match(fechaRegex);
        if (match) {
            if (match[1]) {
                // DD/MM/YYYY
                const day = match[1].padStart(2, '0');
                const month = match[2].padStart(2, '0');
                const year = match[3];
                fecha = `${year}-${month}-${day}`;
            } else if (match[4]) {
                // YYYY-MM-DD
                fecha = `${match[4]}-${match[5].padStart(2, '0')}-${match[6].padStart(2, '0')}`;
            }
            break;
        }
    }

    // Buscar peso/kilogramos (número seguido de kg, KG, o cerca de "PESO")
    const pesoRegex = /(\d+[,.]?\d*)\s*(kg|KG|Kg)/i;
    for (const line of lines) {
        if (line.toLowerCase().includes('peso') || line.toLowerCase().includes('neto')) {
            const match = line.match(/(\d+[,.]?\d*)/);
            if (match) {
                kilogramos = parseFloat(match[1].replace(',', '.'));
                break;
            }
        }
        const match = line.match(pesoRegex);
        if (match) {
            kilogramos = parseFloat(match[1].replace(',', '.'));
            break;
        }
    }

    // Buscar número de tiquete (4-6 dígitos, cerca de "TIQUETE" o "CODIGO")
    for (const line of lines) {
        if (line.toLowerCase().includes('tiquete') ||
            line.toLowerCase().includes('codigo') ||
            line.toLowerCase().includes('interno')) {
            const match = line.match(/(\d{4,6})/);
            if (match) {
                numeroTiquete = match[1];
                break;
            }
        }
    }

    // Buscar valor unitario (número con $ o COP)
    const valorRegex = /\$?\s*(\d+[,.]?\d*)\s*(COP)?/i;
    for (const line of lines) {
        if (line.toLowerCase().includes('valor') ||
            line.toLowerCase().includes('precio') ||
            line.toLowerCase().includes('unitario')) {
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
        rawText: text,
        confidence,
    };
}
