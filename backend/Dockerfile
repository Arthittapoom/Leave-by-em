FROM node:16.20.2-alpine

RUN apk --no-cache add curl g++ gcc libgcc libstdc++ linux-headers make python3

ENV TZ "Asia/Bangkok"

ADD . /app/api/

# WORKDIR /app/api

RUN mkdir -p /usr/src/app/api
WORKDIR /usr/src/app/api

COPY package*.json ./

COPY .env.production .env

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
