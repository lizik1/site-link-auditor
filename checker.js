import fetch from 'node-fetch';

const visitedLinks = new Set();  // Множество для хранения посещенных ссылок
const errors = new Map()
let checkedLinks = 0
const initLink = 'https://developer.auroraos.ru/'
// Проверка доступности ссылки
async function checkLink(url, referrer) {
    if (visitedLinks.has(url)) {
        return;
    }
    url = url.replaceAll(/&amp;/g, '&');
    visitedLinks.add(url);
    checkedLinks += 1

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36'
            },
            redirect: 'follow'
        });

        if (!response.ok) {
            errors.set(url, { "referrer": referrer, "status": response.status });
            // console.log(url, errors.get(url))
            return;
        }

        if (!url.startsWith(initLink)){
          return;  
        }

        if (checkedLinks % 1000 == 0) {
            console.log(`Проверено ${checkedLinks} ссылок`)
        }


        const html = await response.text();
        const links = extractLinks(html, url);
        for (const link of links) {
            await checkLink(link, url)
        }

    } catch (error) {
        errors.set(url, { "referrer": referrer, "status": error.message });
        // console.log(url, errors.get(url))
    }

}


// Извлечение href и src из HTML-страницы
function extractLinks(html, baseUrl) {
    // Регулярное выражение для поиска ссылок и атрибутов src
    const linkRegex = /href\s*=\s*["']([^"']+)["']/g;
    const srcRegex = /src\s*=\s*["']([^"']+)["']/g;

    let match;

    const result = []

    // Поиск href
    while ((match = linkRegex.exec(html)) !== null) {
        const href = match[1];
        if (href.startsWith('mailto:')) {
            continue
        }
        result.push(fixLink(href, baseUrl));
    }

    // Поиск src
    while ((match = srcRegex.exec(html)) !== null) {
        const src = match[1];
        result.push(fixLink(src, baseUrl));
    }
    return result
}

// Обработка ссылок
function fixLink(href, baseUrl) {
    if (href.startsWith(baseUrl)) {
        return href
    } else if (!href.startsWith('https:')) {
        const absoluteUrl = new URL(href, baseUrl).href;
        return absoluteUrl
    }
    return href
}


// Вывод ошибок
function outputErrors() {
    if (errors.size > 0) {
        console.log("Найдены ошибки:");
        errors.forEach((value, key) => {
            console.log(`URL: ${key}, Referrer: ${value.referrer}, Status: ${value.status}`);
        });
    } else {
        console.log("No errors found.");
    }
}

// Получение ссылки из аргументов командной строки и запуск скрипта
const startUrl = process.argv[2];
console.log("Checking...")
checkLink(startUrl, 'Initial Link').then(outputErrors);
