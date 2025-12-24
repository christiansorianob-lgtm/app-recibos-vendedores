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
        setParameters(params: Record<string, string>): Promise<void>;
        detect(image: File | string): Promise<{ data: any }>;
    }

    export function createWorker(
        lang?: string,
        oem?: number,
        options?: {
            logger?: (m: Logger) => void;
        }
    ): Promise<Worker>;
}
