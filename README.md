### Чеклист по сборке проекта:
- запустить все вм
- запустить докер-контейнеры в нем
- посмотреть, работает ли бэкенд?
- поменять IP машины во фронтенде на акутальный ```shell
cd /home/user/cinema-app-main/frontend/src/app/services```
- пересобрать фронт ```shell
 cd /home/user/cinema-app-main/frontend & npm run build --prod```
- скопировать фронт на локальную машину 
```shell
  scp -r totoev@158.160.69.90:/home/user/cinema-app-main/frontend/dist/cinema-frontend/browser ~/Desktop/cinema-frontend-new/```
- загрузить фронт в бакет
- поменять айпишник в секретах яндекса
- открыть сайт

### Фронтенд доступен по адресу: https://cinema-app-project.website.yandexcloud.net/

(IP-адреса машин бэкенда и БД нестатичные и меняются!)
