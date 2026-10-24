# SpringVision — состояние и оставшиеся настройки

## Что уже подключено

- Supabase-проект: `dgdjddkaixjlscyqkpwz` (переиспользованный проект `rbn`).
- Базовая схема SpringVision и миграция финальных медиа применены.
- В базе есть 156 стран.
- Приватный Storage bucket `springvision-private` создан миграцией.
- Edge Function `api` развёрнута.
- `config.js` подключён к Supabase URL и публичному publishable key.
- Старые таблицы RBN сохранены под именами `legacy_rbn_*`; они не удалялись.
- SVG-флаги в форме сердца не изменялись.

## Обязательная настройка секретов

Функция не примет обычные запросы, пока в ней не заданы серверные секреты. Их нельзя добавлять в GitHub, `config.js`, HTML или отправлять в переписке.

1. Откройте [Supabase Edge Functions Secrets](https://supabase.com/dashboard/project/dgdjddkaixjlscyqkpwz/settings/functions).
2. Добавьте следующие значения:
   - `TELEGRAM_BOT_TOKEN` — токен `@SpringVisionnbot` из @BotFather.
   - `SPRINGVISION_OWNER_TELEGRAM_ID` — ваш числовой Telegram ID, не username.
   - `SPRINGVISION_CRON_SECRET` — длинная случайная строка, которую больше нигде публично не используете.
3. Не добавляйте `SUPABASE_SERVICE_ROLE_KEY` вручную в клиентский код. Supabase предоставляет эту переменную Edge Function автоматически.

## Напоминания жюри

В GitHub откройте **Settings → Secrets and variables → Actions** и добавьте:
- `SPRINGVISION_SUPABASE_URL` = `https://dgdjddkaixjlscyqkpwz.supabase.co`
- `SPRINGVISION_SUPABASE_ANON_KEY` = публичный publishable key проекта из `config.js`
- `SPRINGVISION_CRON_SECRET` = то же значение, что добавлено в Supabase.

Workflow `.github/workflows/jury-reminders.yml` запускается каждые два часа. До дедлайна он напоминает жюри, которое ещё не проголосовало. После дедлайна закрывает голосование жюри и создаёт резервные случайные бюллетени только тем, у кого нет сохранённого голоса.

## Публикация сайта

Изменения сейчас находятся в ветке `feature/springvision-backend` и PR #2. После проверки и слияния в `main` проверьте **Settings → Pages**: публикация должна идти из ветки `main`, корневой папки `/(root)`. URL сайта должен быть HTTPS и установлен как Web App URL у `@SpringVisionnbot`.

## Контрольный запуск

После установки секретов проверьте внутри Telegram:
1. Открытие Mini App и загрузку профиля.
2. Создание тестового сезона из админ-панели.
3. Отправку тестовой заявки с рекапом.
4. Отображение имени, `@username` и Telegram ID заявителя в модерации.
5. Одобрение/отклонение заявки и комментарий.
6. Жеребьёвку, закрытое голосование жюри, телеголосование и ручную публикацию результатов.
7. Скрытие результатов до ручного раскрытия и ручную публикацию Twitch/записи финала.

Не запускайте реальный сезон, пока не проверите этот цикл тестовыми аккаунтами. При отсутствии секретов сайт должен показывать ошибку настройки сервера, а не имитировать успешную заявку.
