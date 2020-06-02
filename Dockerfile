#基于centos镜像
FROM node:13.13

#维护人的信息
MAINTAINER secKill <444811296@qq.com>

#复制网站首页文件至镜像中web站点下
COPY src /app/src
COPY package.json /app
COPY tsconfig.json /app

WORKDIR  /app


#安装基本依赖 并编译
RUN npm install -g cnpm --registry=https://registry.npm.taobao.org \
    && cnpm i \
    && npm run build


#开启8090端口
EXPOSE 8090

#当启动容器时执行的脚本文件
CMD ["npm","start"]