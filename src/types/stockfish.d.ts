declare module 'stockfish' {
  export class Engine {
    constructor(path: string);
    onmessage: ((message: string) => void) | null;
    postMessage(command: string): void;
    terminate(): void;
  }
}