FROM node:18
RUN mkdir /website-app
COPY package.json /website-app/
WORKDIR /website-app
COPY ../

RUN npm install
RUN npm build
EXPOSE 3000

CMD ["npm", "run","start"]