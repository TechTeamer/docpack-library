FROM node:16

RUN useradd -m appuser

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 3000

CMD ["npx", "nodemon", "index.js"]
