import LinkChecker from 'site-link-auditor';


const startUrl = "https://your-link.ru/";
const linkChecker = new LinkChecker(startUrl, false);
const result = await linkChecker.run();
console.log(result)