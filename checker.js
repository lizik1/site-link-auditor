import fetch from 'node-fetch';

const visitedLinks = new Set();  // Множество для хранения посещенных ссылок
const errors = new Map()
const MAX_CONCURRENT_REQUESTS = 5;
let checkedLinks = 0
const queue = []; 

// Проверка доступности ссылки
async function checkLink(url, referrer) {
    if (visitedLinks.has(url)) {
        return;
    }
    url = url.replace(/&amp;/g, '&');
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
        
        if (response.status >= 300 && response.status < 600) {
            errors.set(url, { "referrer": referrer, "status": response.status});
        }


        if (response.ok) {
            const html = await response.text();
            extractLinks(html, url);
        }
    } catch (error) {
        errors.set(url, { "referrer": referrer, "status": error.message} );
    }
    if (checkedLinks % 1000 == 0){
        console.log(`Проверено ${checkedLinks} ссылок`)
    }
}


// Извлечение href и src из HTML-страницы
function extractLinks(html, baseUrl) {
    // Регулярное выражение для поиска ссылок и атрибутов src
    const linkRegex = /href\s*=\s*["']([^"']+)["']/g;
    const srcRegex = /src\s*=\s*["']([^"']+)["']/g;

    let match;

    // Поиск href
    while ((match = linkRegex.exec(html)) !== null) {
        const href = match[1];
        handleLink(href, baseUrl);
    }

    // Поиск src
    while ((match = srcRegex.exec(html)) !== null) {
        const src = match[1];
        handleLink(src, baseUrl);
    }
}

// Обработка ссылок
async function handleLink(href, baseUrl) {
    if (href.startsWith(baseUrl) && !visitedLinks.has(href)) {
        addToQueue(href, baseUrl);
    } else if (href.startsWith('/')) {
        const absoluteUrl = new URL(href, baseUrl).href;
        if (!visitedLinks.has(absoluteUrl)) {
            addToQueue(absoluteUrl, baseUrl);

        }
    }
}

// очередь
function addToQueue(url, referrer) {
    queue.push(() => checkLink(url, referrer));
    processNextInQueue();
}

let activeRequests = 0; 
async function processNextInQueue() {
    if (queue.length === 0 || activeRequests >= MAX_CONCURRENT_REQUESTS) {
        // Если очередь пуста и нет активных запросов, выводим ошибки
        if (queue.length === 0 && activeRequests === 0) {
            outputErrors();
        }
        return;
    }

    activeRequests++;
    const nextInQueue = queue.shift(); 
    await nextInQueue();
    activeRequests--; 
    processNextInQueue(); 
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
checkLink(startUrl, 'Initial Link');