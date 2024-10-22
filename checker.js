import fetch from 'node-fetch';

const visitedLinks = new Set();  // Множество для хранения посещенных ссылок
const errors = new Map()
let checkedLinks = 0

// Проверка доступности ссылки
async function checkLink(url, referrer, level = 0) {
    if(visitedLinks.has(url)) {
        return
    }

    visitedLinks.add(url);
    checkedLinks += 1

    // если вдруг вышли за пределы сайта, то выведем в лог
    if(!referrer.startsWith(rootHost)) {
        console.log(`${url} <- ${referrer} : total ${visitedLinks.size}`);
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
            errors.set(url, { "referrer": referrer, "status": response.status });
            console.log(url, errors.get(url))
            return;
        }

        // Парсим только HTML и внутренние ссылки
        if (!url.startsWith(rootHost) || !response.headers.get('content-type').match("text/html")) {
            return;
        }

        if (checkedLinks % 100 === 0) {
            console.log(`Проверено ${checkedLinks} ссылок`)
        }

        const html = await response.text();
        const links = extractLinks(html, url);
        for (const link of links) {
             await checkLink(link, url, level + 1);
        }

    } catch (error) {
        errors.set(url, { "referrer": referrer, "status": error.message });
        console.log(url, errors.get(url))
    }
}


// Извлечение href и src из HTML-страницы
function extractLinks(html, baseUrl) {
    const linkAndSrcRegex = /(?:href|src)\s*=\s*["']([^"']+)["']/g;
    const result = new Set();
    let match;

    while ((match = linkAndSrcRegex.exec(html)) !== null) {
        const url = match[1].replaceAll(/&amp;/g, '&');

        if (!url.startsWith('mailto:')) {
            // приводим ссылку к нормальному состоянию и убираем якорь
            result.add((url.startsWith("https") ? url : new URL(url, baseUrl).href).split("#")[0]);
        }
    }

    return Array.from(result);
}

// Вывод ошибок
function outputErrors() {
    console.log(`Обработано ссылок: ${checkedLinks}`)
    if (errors.size > 0) {
        console.log(`Найдены ошибки: ${errors.size}`);
        errors.forEach((value, key) => {
            console.log(`URL: ${key}, Referrer: ${value.referrer}, Status: ${value.status}`);
        });
    } else {
        console.log("No errors found.");
    }
}

// Получение ссылки из аргументов командной строки и запуск скрипта
const startUrl = process.argv[2];
const rootHost = `${ new URL(startUrl).protocol}//${ new URL(startUrl).hostname}`;
console.log("Checking...")
checkLink(startUrl, 'Initial Link').then(outputErrors);
