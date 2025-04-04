# Site link Auditor
## Описание
Скрипт предназначен для проверки доступности ссылок на указанной веб-странице. Процесс проверки организован с использованием стека, в который добавляются новые ссылки. Чтобы обеспечить эффективность, проверки выполняются параллельно, и вы можете указать количество потоков для выполнения. Для этого при создании экземпляра нужно указать число потоков:
```js
const linkChecker = new LinkChecker(startUrl, 50, true);
```
Для ссылок, которые возвращают статус 429 (Слишком много запросов), предусмотрена специальная обработка — они проверяются в однопоточном режиме.
## Использование
Для начала необходимо установить зависимости с помощью команды
```bash
npm i site-link-auditor
```
Команда для запуска
```
npm run build && npm run start > errors.txt
```
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
