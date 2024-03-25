FROM node:16 AS build-stage

WORKDIR /app

COPY package*.json ./

COPY .babelrc ./

COPY eslintrc.json ./

COPY .env ./

COPY index.js ./

COPY src ./src

RUN npm install

RUN npm run build

FROM node:16 AS production-stage

WORKDIR /app

COPY --from=build-stage /app/dist ./dist

COPY index.js package*.json .env ./

RUN npm install --only=production

ENV PORT 80

EXPOSE 80

CMD ["node", "dist/index.js"]
