FROM node:24-alpine3.21

WORKDIR /app

COPY package*.json .

RUN npm i -g pnpm pm2
RUN pnpm install

COPY . .

EXPOSE 3000

CMD ["pm2-runtime", "ecosystem.config.cjs"]

