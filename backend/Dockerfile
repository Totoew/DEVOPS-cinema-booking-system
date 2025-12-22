FROM node:18-alpine

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь код
COPY . .

# Открываем порт
EXPOSE 4000

# Запускаем приложение
CMD ["npm", "run", "dev"]