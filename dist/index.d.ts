import { ErrorInfo } from './types/ErrorTypes.js';
export declare class LinkChecker {
    private startUrl;
    private threads;
    private logs;
    private errors;
    private checkedLinks;
    private queue;
    private visitedLinks;
    private readonly oneThread;
    constructor(startUrl: string, threads?: number, logs?: boolean);
    private checkLink;
    private extractLinks;
    outputErrors(): void;
    run(): Promise<void>;
    getErrors(): Map<string, ErrorInfo>;
}
