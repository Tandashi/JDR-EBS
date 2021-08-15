FROM node:14

RUN apt-get update && apt-get install -y yarn 
RUN mkdir -p /home/application /data/static /data/songs
WORKDIR /home/application 
COPY src src
COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY tslint.json tslint.json
COPY definitions definitions
RUN yarn -v && yarn && yarn build

ENTRYPOINT node -r dotenv/config dist/ebs.js

EXPOSE 3000