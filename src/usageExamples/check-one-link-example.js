import { LinkChecker } from 'site-link-auditor';


const startUrl = "https://YOUR-LINK.ru/";
const linkChecker = new LinkChecker(startUrl, 1);
const result = await linkChecker.run();
console.log(result)
// process.exit(0)