FROM node:12 as build

WORKDIR /app

USER root

COPY package.json ./

RUN yarn config set registry https://registry.npm.taobao.org

RUN yarn install 

COPY ./ ./

RUN ./build.sh

From nginx as publish

WORKDIR /app

COPY --from=build /app/build .

COPY --from=build /app/bin/nginx.conf /etc/nginx/nginx.conf


EXPOSE 80