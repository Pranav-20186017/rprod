
FROM node:12.14.1-alpine

ADD ./src/ /code/

WORKDIR /code

EXPOSE 3000

RUN npm i package.json

CMD ["node","server.js"]


