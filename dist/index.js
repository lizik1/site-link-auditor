import fetch from 'node-fetch';
export class LinkChecker {
    visitedLinks;
    errors;
    checkedLinks;
    rootHost;
    startUrl;
    depth;
    recursions;
    constructor(startUrl, depth) {
        this.visitedLinks = new Set();
        this.errors = new Map();
        this.checkedLinks = 0;
        this.rootHost = `${new URL(startUrl).protocol}//${new URL(startUrl).hostname}`;
        this.startUrl = startUrl;
        this.depth = depth;
        this.recursions = 0;
    }
    async checkLink(url, referrer, depth) {
        this.recursions++;
        if (this.visitedLinks.has(url) || (depth != undefined && depth <= 0)) {
            this.recursions--;
            return;
        }
        this.visitedLinks.add(url);
        this.checkedLinks += 1;
        // если вдруг вышли за пределы сайта, то выведем в лог
        if (!referrer.startsWith(this.rootHost)) {
            console.error(`${url} <- ${referrer} : total ${this.visitedLinks.size}`);
        }
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36'
                },
                redirect: 'follow',
            });
            if (!response.ok) {
                this.errors.set(url, { referrer, status: response.status });
                console.error(url, this.errors.get(url));
                this.recursions--;
                return;
            }
            // Парсим только HTML и внутренние ссылки
            if (!url.startsWith(this.rootHost) || !(response.headers.get('content-type')?.includes("text/html"))) {
                this.recursions--;
                return;
            }
            if (this.checkedLinks % 1000 === 0) {
                console.log(`Проверено ${this.checkedLinks} ссылок`);
            }
            const html = await response.text();
            const links = this.extractLinks(html, url);
            for (const link of links) {
                await this.checkLink(link, url, depth ? depth - 1 : undefined);
            }
        }
        catch (error) {
            this.errors.set(url, { referrer, status: error instanceof Error ? error.message : 'Unknown error' });
            console.error(url, this.errors.get(url));
        }
        this.recursions--;
    }
    // Извлечение href и src из HTML-страницы
    extractLinks(html, baseUrl) {
        const linkAndSrcRegex = /(?:href|src)\s*=\s*["']([^"']+)["']/g;
        const result = new Set();
        let match;
        while ((match = linkAndSrcRegex.exec(html)) !== null) {
            const url = match[1].replace(/&amp;/g, '&');
            if (!url.startsWith('mailto:')) {
                // приводим ссылку к нормальному состоянию и убираем якорь
                result.add((url.startsWith("https") ? url : new URL(url, baseUrl).href).split("#")[0]);
            }
        }
        return Array.from(result);
    }
    outputErrors() {
        console.log(`Обработано ссылок: ${this.checkedLinks}`);
        if (this.errors.size > 0) {
            console.log(`Найдены ошибки: ${this.errors.size}`);
            this.errors.forEach((value, key) => {
                console.log(`URL: ${key}, Referrer: ${value.referrer}, Status: ${value.status}`);
            });
        }
        else {
            console.log("No errors found.");
        }
    }
    async run() {
        await this.checkLink(this.startUrl, 'Initial Link', this.depth);
        console.log(`Незавершенных рекурсий: ${this.recursions}`);
        this.outputErrors();
        return this.errors;
    }
}
