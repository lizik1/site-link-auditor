import fetch from 'node-fetch';
import { ErrorInfo } from './types/ErrorTypes.js';

interface QueueType {
  url: string;
  referrer: string;
}

export class LinkChecker {
  private errors: Map<string, ErrorInfo> = new Map();
  private checkedLinks: number = 0;
  private queue: QueueType[];
  private visitedLinks: Set<string> = new Set();
  private readonly oneThread: QueueType[] = [];


  constructor(private startUrl: string, private threads: number = 1, private logs = false) {
    this.queue = [{ url: startUrl, referrer: 'Init' }];
  }

  private async checkLink(url: string, referrer: string, attempt: number = 1): Promise<QueueType[]> {
    const MAX_ATTEMPTS = 20;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
          'Cookie': '_ignoreAutoLogin=1; signin=autosignin'
        },
        redirect: 'follow',
        follow: 20,
        signal: AbortSignal.timeout(15000)
      });

      if (response.status === 429) {
        if (this.threads === 1) {
          if (attempt >= MAX_ATTEMPTS) {
            if (this.logs) {
              console.log(`Получен статус 429. Достигнуто максимальное число попыток для URL: ${url} `);
            }
            return [];
          } else {
            if (this.logs) {
              console.log(`Получен статус 429. Ожидание перед повторной попыткой...`);
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
            return await this.checkLink(url, referrer, attempt + 1);
          }

        } else {
          this.oneThread.push({ referrer: referrer, url: url })
          return [];
        }
      }


      if (!response.ok) {
        this.errors.set(url, { referrer, status: response.status });
        return [];
      }

      // Парсим только HTML и внутренние ссылки не выходя за пределы стартового url
      if (!response.url.startsWith(this.startUrl) || !(response.headers.get('content-type')?.includes("text/html"))) {
        return [];
      }

      const html = await response.text();
      return this.extractLinks(html, url)

    } catch (error) {
      this.errors.set(url, { referrer, status: error instanceof Error ? error.message : 'Unknown error' });
    }
    return []
  }

  // Извлечение href и src из HTML-страницы
  private extractLinks(html: string, baseUrl: string): QueueType[] {
    html = html.replace(/<!--[\s\S]*?-->/g, "");
    const linkAndSrcRegex = /(?:href|src)\s*=\s*["']([^"']+)["']/g;
    const result = new Set<QueueType>();
    let match: RegExpExecArray | null;

    while ((match = linkAndSrcRegex.exec(html)) !== null) {
      const url = match[1].replace(/&amp;/g, '&');

      if (!url.startsWith('mailto:')) {
        // приводим ссылку к нормальному состоянию и убираем якорь
        result.add(
          { url: (url.startsWith("https") ? url : new URL(url, baseUrl).href).split("#")[0], referrer: baseUrl }
        );
      }
    }
    return Array.from(result);
  }

  public outputErrors(): void {
    console.log(`Обработано ссылок: ${this.checkedLinks}`);
    if (this.errors.size > 0) {
      console.log(`Найдены ошибки: ${this.errors.size}`);
      this.errors.forEach((value, key) => {
        console.log(`URL: ${key}, Referrer: ${value.referrer}, Status: ${value.status}`);
      });
    } else {
      console.log("No errors found.");
    }
  }

  public async run(): Promise<void> {
    let lastChecked = 0;
    const promises: Promise<QueueType[]>[] = [];
    while (this.queue.length > 0) {
      const item = this.queue.pop();
      if (item) {
        const { url, referrer } = item;
        if (!this.visitedLinks.has(url)) {
          this.visitedLinks.add(url);
          promises.push(this.checkLink(url, referrer));
          if (promises.length >= this.threads || this.queue.length === 0) {
            const results = await Promise.all(promises);
            results.forEach((result) => {
              result?.forEach((link: QueueType) => !this.visitedLinks.has(link.url) && this.queue.push(link));
            })
            promises.length = 0;

            this.checkedLinks += results.length;
          }
        }
      }

      if (this.logs && this.checkedLinks - lastChecked > 100) {
        console.log(`Проверено ${this.checkedLinks} ссылок, в очереди ${this.queue.length}, ошибок ${this.errors.size}`);
        lastChecked = this.checkedLinks
      }
    }

    if (promises.length > 0) {
      const results = await Promise.all(promises);
      results.forEach((result) => {
        result?.forEach((link: QueueType) => this.queue.push(link));
      })
      promises.length = 0;

      this.checkedLinks += results.length;
    }

    // если есть ссылки с 429, то заменим очередь, переключимся на 1 поток и запустим заново
    if (this.logs && this.oneThread.length > 0) {
      console.log(`Одно поточная проверка ошибок со статусом 429. Количество: ${this.oneThread.length}`);
      this.queue = [...this.oneThread];
      this.oneThread.length = 0;
      this.threads = 1;
      await this.run();
    }
  }

  public getErrors(): Map<string, ErrorInfo> {
    return this.errors;
  }
}

// пример использования
// async function runLinkChecker() {
//     console.time('Link checking');
//     const startUrl = "https://developer.auroraos.ru/";
//     const linkChecker = new LinkChecker(startUrl, 50, true);
//     await linkChecker.run();
//     linkChecker.outputErrors();
//     console.timeEnd('Link checking');
// }
// runLinkChecker().catch(e => {
//     console.log('Ошибка при выполнении проверки ссылок:', e);
// });
