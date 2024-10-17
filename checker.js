import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const visitedLinks = new Set();  // Множество для хранения посещенных ссылок
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


// Функция для проверки доступности ссылки
async function checkLink(url, referrer) {
    if (visitedLinks.has(url)) {
        return;
    }

    visitedLinks.add(url);

    try {
        await delay(1000);
        const response = await fetch(url, {
            method: "HEAD",
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36'
            }
        });
        if (response.status >= 300 && response.status < 600) {
            console.log(`Link: ${url} | Referrer: ${referrer} | Status: ${response.status}`);
        }


        if (response.ok) {
            const html = await fetch(url).then(res => res.text());
            extractLinks(html, url);
        }
    } catch (error) {
        // if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
        //     setTimeout(() => checkLink(url, referrer), 5000);
        // }
        console.error(`${url} | Referrer: ${referrer} | Status: ERROR (${error.message})`);
    }
}

// Функция для извлечения ссылок из HTML-страницы
function extractLinks(html, baseUrl) {
    const $ = cheerio.load(html);
    $('a').each((i, element) => {
        const href = $(element).attr('href');
        if (href) {
            // Пока проверяем только ссылки, ведущие на developer.aurora.ru
            if (href.startsWith(baseUrl) && !visitedLinks.has(href)) {
                checkLink(href, baseUrl);
            } else if (href.startsWith('/')) {
                const absoluteUrl = new URL(href, baseUrl).href
                if (!visitedLinks.has(absoluteUrl)) {
                    checkLink(absoluteUrl, baseUrl);
                }
            }
        }
    });
}

// Получение ссылки из аргументов командной строки и запуск скрипта
const startUrl = process.argv[2];
console.log("Checking...")
checkLink(startUrl, 'Initial Link');