# Сайт‑визитка психолога (одна страница)

Статическая страница без сборки и зависимостей.

## Как открыть

1) Откройте файл `index.html` в браузере (двойной клик).

Или (вариант с локальным сервером — иногда удобнее):

```bash
cd "/Users/user/untitled folder"
python3 -m http.server 5173
```

Затем откройте в браузере `http://localhost:5173`.

## Что редактировать

- Текст и секции: `index.html`
- Внешний вид: `styles.css`
- Логика меню/формы/фоллбеков картинок: `script.js`

## Быстрая настройка контактов

В секции «Запись» в `index.html` замените заглушки:
- Telegram: ссылка вида `https://t.me/username`
- WhatsApp: ссылка вида `https://wa.me/7XXXXXXXXXX`

## Фото психолога

1) Положите фото в папку `assets/` и назовите файл:
- `assets/ekaterina.jpg`

2) Страница уже ожидает этот файл в hero‑блоке. Если хотите другое имя — поменяйте `src` у картинки в `index.html`.

## Аватар (рисунок) для карточки в первом экране

Чтобы использовать ваш рисунок‑аватар (как во вложении), сохраните его как:
- `assets/avatar-ekaterina.png`

И перезагрузите страницу — аватар появится в карточке «Добро пожаловать!».

## «Заметки психолога» (картинка слева)

Секция «Заметки психолога» собирается из HTML‑шаблонов в `index.html`:
- заметки лежат в `<template data-notes-template="1">`, `<template data-notes-template="2">` и т.д.
- переключение «Предыдущая / Ещё заметки» делает `setupNotesNavigation()` в `script.js`

Если картинка в заметке не загрузилась — автоматически подставится `assets/avatar-ekaterina.png`.

Чтобы добавить новую заметку:
- добавьте новый блок `<template data-notes-template="N">` в `index.html`
- укажите картинку в `<img class="notes-img" src="...">`

## Форма записи → письмо на почту

Чтобы при отправке формы на сайте письмо **автоматически** приходило на `arinashkapa@ya.ru`, нужен сервис отправки форм (или бэкенд).

### Вариант 1 (проще всего): Formspree

1) Зарегистрируйтесь в Formspree и создайте форму с получателем `arinashkapa@ya.ru`.
2) Скопируйте endpoint вида `https://formspree.io/f/XXXXYYYY` (в вашем случае: `https://formspree.io/f/mvzrdbgn`).
3) В `index.html` найдите форму в секции «Запись» и замените:

- `https://formspree.io/f/YOUR_FORM_ID` → на ваш endpoint (сейчас уже стоит `https://formspree.io/f/mvzrdbgn`).

Пока endpoint не указан, сайт сделает fallback: откроет письмо через ваше почтовое приложение (mailto).

## Публикация на GitHub Pages

1) Создайте новый репозиторий на GitHub (пустой).

2) Включите GitHub Pages:
- `Settings` → `Pages`
- **Build and deployment** → **Source**: `GitHub Actions`

3) Залейте код в ветку `main` — деплой запустится автоматически (workflow лежит в `.github/workflows/pages.yml`).


