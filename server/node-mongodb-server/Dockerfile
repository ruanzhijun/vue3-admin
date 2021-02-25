FROM node:14.16.0-alpine as base
WORKDIR /srv/app
RUN echo https://mirrors.ustc.edu.cn/alpine/v3.13/main/ > /etc/apk/repositories
RUN echo https://mirrors.ustc.edu.cn/alpine/v3.13/community/ >> /etc/apk/repositories
RUN apk update && apk upgrade --available
RUN apk add --no-cache -U tzdata
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN echo "Asia/Shanghai" > /etc/timezone
RUN apk del tzdata
COPY package.json .
RUN npm i --production --registry http://registry.npm.taobao.org && mv node_modules node_modules_prod
RUN npm i --registry http://registry.npm.taobao.org

FROM node:14.16.0-alpine as build
WORKDIR /srv/app
COPY --from=base /srv/app/node_modules ./node_modules
COPY --from=base /srv/app/package.json ./package.json
COPY ./tsconfig.json ./tsconfig.json
COPY ./src ./src
RUN npm run build

FROM node:14.16.0-alpine
WORKDIR /srv/app
RUN rm -rf /etc/localtime /etc/timezone
COPY --from=base /etc/localtime /etc/localtime
COPY --from=base /etc/timezone /etc/timezone
COPY --from=base /srv/app/node_modules_prod ./node_modules
COPY --from=base /srv/app/package.json ./package.json
COPY --from=build /srv/app/app /srv/app/app
COPY ./cert ./cert
COPY ./config ./config
CMD ["node", "app/main.js"]

