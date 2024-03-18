FROM node:18 AS build-stage

WORKDIR /app

COPY package*.json ./
COPY webpack.config.cjs ./
COPY .babelrc ./
COPY src/ ./src/
COPY public/ ./public/

RUN npm install

RUN npm run build

FROM node:18 AS production-stage

WORKDIR /app

COPY package*.json ./

COPY --from=build-stage /app/src/server ./server
COPY --from=build-stage /app/dist ./dist

RUN npm install --only=production

ENV PORT 80
EXPOSE 80

CMD ["node", "server/index.js"]