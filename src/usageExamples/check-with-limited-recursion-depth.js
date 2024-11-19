import { LinkChecker } from 'site-link-auditor';


const startUrl = "https://YOUR-LINK.ru/";
// Проверяем все ссылки на глубине 2
const linkChecker = new LinkChecker(startUrl, 2);
const result = await linkChecker.run();
console.log(result)
// process.exit(0)