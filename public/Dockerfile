FROM node:18

WORKDIR /app

COPY . .

RUN npm install
RUN cd client && npm install && npm run build

ENV PORT 80

EXPOSE 80

CMD ["node", "server/src/app.js"]
