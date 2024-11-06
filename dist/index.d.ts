import { ErrorInfo } from './types/ErrorTypes.js';
export declare class LinkChecker {
    private visitedLinks;
    private errors;
    private checkedLinks;
    private rootHost;
    private startUrl;
    private recursion;
    constructor(startUrl: string, recursion: boolean);
    private checkLink;
    private extractLinks;
    private outputErrors;
    run(): Promise<Map<string, ErrorInfo>>;
}
