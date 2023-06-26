FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
COPY . .

RUN yarn install
RUN yarn build

EXPOSE 3000

CMD [ "node", "dist/index.js" ]