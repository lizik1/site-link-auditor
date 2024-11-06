# Site link Auditor
## Описание
Скрипт проверяет доступность ссылок на переданной странице. Возможна проверка доступности конкретной ссылки, для этого необходимо передать в качестве параметра рекурсии значение false, а также рекурсивная проверка ссылок по переданному адресу, в таком случае параметр рекурсии - true. 

## Использование
Для начала необходимо установить зависимости с помощью команды
```bash
npm i
```
Примеры использования находятся в папке src/usageExamples/

```js
import { LinkChecker } from 'site-link-auditor';


const startUrl = "https://YOUR-LINK.ru/";
const linkChecker = new LinkChecker(startUrl, false);
const result = await linkChecker.run();
console.log(result)
```
