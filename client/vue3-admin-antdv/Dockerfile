FROM node:20.14.0-alpine3.20 as base
WORKDIR /srv/app
RUN echo https://mirrors.ustc.edu.cn/alpine/v3.16/main/ > /etc/apk/repositories
RUN echo https://mirrors.ustc.edu.cn/alpine/v3.16/community/ >> /etc/apk/repositories
RUN apk update && apk upgrade --available
COPY ./package.json ./package.json
RUN npm i --force

FROM node:20.14.0-alpine3.20 as build
WORKDIR /srv/app
COPY --from=base /srv/app/node_modules ./node_modules
COPY ./ ./
RUN npm run build

FROM nginx:1.26.0-alpine
WORKDIR /srv/app
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY --from=build /srv/app/dist ./dist
