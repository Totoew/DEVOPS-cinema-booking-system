## Чеклист по сборке и запуску проекта 

> **Важно:** IP-адреса виртуальных машин в Яндекс.Облаке могут быть нестатичными (меняться после перезапуска). Для продакшена рекомендуется использовать [статические адреса](https://cloud.yandex.ru/docs/vpc/concepts/address#static) или доменные имена.

### Этап 1: Запуск инфраструктуры
1.  **Запустить все ВМ** в Яндекс.Облаке.
    *   ВМ для бэкенда и БД: **`89.169.167.142`** (актуальный на момент составления)
      
2.  **Запустить Docker-контейнеры** на целевой ВМ.
    ```bash
    # Подключиться к ВМ
    ssh totoev@89.169.167.142

    # Запустить контейнер с PostgreSQL (если ещё не запущен)
    docker run -d --name cinema-postgres \
      -e POSTGRES_DB=cinema_db \
      -e POSTGRES_USER=user \
      -e POSTGRES_PASSWORD=password \
      -p 5432:5432 \
      --restart unless-stopped \
      postgres:15

    # Убедиться, что образ бэкенда загружен и запустить его
    docker run -d \
      -p 4000:4000 \
      --restart unless-stopped \
      --name cinema-backend \
      cr.yandex/crpqbcc18u09371tvild/cinema-backend:1.0
    ```

3.  **Проверить работоспособность бэкенда.**
    ```bash
    # Проверить логи контейнера (должна быть строка "Backend is running on port 4000" без ошибок ECONNREFUSED)
    docker logs cinema-backend --tail 10

    # Протестировать API-эндпоинт
    curl http://localhost:4000/movies
    ```

### Этап 2: Подготовка и деплой фронтенда
4.  **Обновить IP-адрес бэкенда в коде фронтенда.**
    Перейти в директорию с сервисом и отредактировать файл `api.service.ts`, заменив `baseUrl` на актуальный IP ВМ (например, `http://89.169.167.142:4000`).
    ```bash
    cd /home/user/cinema-app-main/frontend/src/app/services
    nano api.service.ts
    ```

5.  **Пересобрать фронтенд для production.**
    ```bash
    cd /home/user/cinema-app-main/frontend
    npm run build --prod
    ```
    *Собранные файлы появятся в папке `dist/cinema-frontend/browser/`.*

6.  **Скопировать собранный фронтенд на локальную машину** для загрузки в бакет.
    ```bash
    # Выполнить на вашем локальном Mac (заменив IP на актуальный адрес ВМ)
    scp -r totoev@89.169.167.142:/home/user/cinema-app-main/frontend/dist/cinema-frontend/browser ~/Desktop/cinema-frontend-new/
    ```

7.  **Загрузить файлы фронтенда в S3-бакет** `cinema-app-project`.
    Это можно сделать через веб-консоль Яндекс.Облака или CLI, предварительно удалив старые файлы из бакета.

8.  **Обновить секреты/конфигурации в Яндекс.Облаке**, если IP-адрес ВМ изменился (например, в правилах балансировщика нагрузки или переменных окружения).

### Этап 3: Проверка
9.  **Открыть сайт** в браузере.
    Фронтенд доступен по адресу: [https://cinema-app-project.website.yandexcloud.net/](https://cinema-app-project.website.yandexcloud.net/)

10. **Протестировать полный цикл:** регистрация, выбор фильма и сеанса, бронирование мест, оплата.

---

### Актуальные адреса проекта
*   **Фронтенд (статичный хостинг):** [https://cinema-app-project.website.yandexcloud.net/](https://cinema-app-project.website.yandexcloud.net/)
*   **Бэкенд (API, может меняться):** `http://89.169.167.142:4000`
*   **Контейнерный реестр (образы):** `cr.yandex/crpqbcc18u09371tvild/`
