import { ErrorInfo } from './types/ErrorTypes.js';
export declare class LinkChecker {
    private visitedLinks;
    private errors;
    private checkedLinks;
    private rootHost;
    private startUrl;
    private depth;
    private recursions;
    constructor(startUrl: string, depth: number | undefined);
    private checkLink;
    private extractLinks;
    private outputErrors;
    run(): Promise<Map<string, ErrorInfo>>;
}
