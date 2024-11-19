import { LinkChecker } from 'site-link-auditor';


const startUrl = "https://YOUR-LINK.ru/";
const linkChecker = new LinkChecker(startUrl);
const result = await linkChecker.run();
console.log(result)
// process.exit(0)

// Будет проверена сама ссылка, после скрипт рекурсивно обойдет все ссылки сайта, не выходя за его пределы