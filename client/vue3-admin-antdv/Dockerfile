FROM node:14.16.0-alpine as base
WORKDIR /srv/app
RUN echo https://mirrors.ustc.edu.cn/alpine/v3.13/main/ > /etc/apk/repositories
RUN echo https://mirrors.ustc.edu.cn/alpine/v3.13/community/ >> /etc/apk/repositories
RUN apk update && apk upgrade --available
COPY ./package.json ./package.json
RUN npm i --registry https://registry.npm.taobao.org

FROM node:14.16.0-alpine as build
WORKDIR /srv/app
COPY --from=base /srv/app/node_modules ./node_modules
COPY ./ ./
RUN npm run build

FROM nginx:1.18.0-alpine
WORKDIR /srv/app
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY --from=build /srv/app/dist ./dist
COPY ./public/chrome.png ./dist/chrome.png
COPY ./public/browser.html ./dist/browser.html
