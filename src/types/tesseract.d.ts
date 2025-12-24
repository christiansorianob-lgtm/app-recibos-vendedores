declare module 'tesseract.js' {
    export interface Logger {
        status: string;
        progress: number;
    }

    export interface RecognizeResult {
        data: {
            text: string;
            confidence: number;
        };
    }

    export interface Worker {
        recognize(image: File | string): Promise<RecognizeResult>;
        terminate(): Promise<void>;
    }

    export function createWorker(
        lang?: string,
        oem?: number,
        options?: {
            logger?: (m: Logger) => void;
        }
    ): Promise<Worker>;
}
