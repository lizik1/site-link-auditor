# Site link Auditor
## Описание
Скрипт проверяет доступность ссылок на переданной странице. Возможна проверка страниц по глубине рекурсии. При добавлении параметра depth=1, скрипт проверит только саму ссылку, при указании depth=2 проверит саму страницу и ссылки на переданной странице, что соответствует глубине рекурсии 2 и т.д. В случае, если нужна полная рекурсивная проверка сайта, просто не используйте параметр depth при создании экземпляра класса. 

## Использование
Для начала необходимо установить зависимости с помощью команды
```bash
npm i site-link-auditor
```
Команда для запуска
```
npm run build && npm run start > errors.txt
```
Примеры использования находятся в папке *src/usageExamples/*.
Пример полной рекурсивной проверки сайта:
```js
import { LinkChecker } from 'site-link-auditor';


casync function runLinkChecker() {
  console.time('Link checking');
  const startUrl = "https://YOUR-LINK.ru/";
  const linkChecker = new LinkChecker(startUrl, 50, true);
  await linkChecker.run();
  linkChecker.outputErrors();
  console.timeEnd('Link checking');
}

runLinkChecker().catch(e => {
  console.log('Ошибка при выполнении проверки ссылок:', e);
});
```
