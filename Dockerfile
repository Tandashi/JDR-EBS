FROM node:14

# Set Timezone
ENV TZ=Europe/Berlin
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Update and install yarn
RUN apt-get update && apt-get install -y yarn 

# Create Application relevant folders
RUN mkdir -p /home/application /data/static /data/songs

# Copy application
WORKDIR /home/application 
COPY src src
COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY tslint.json tslint.json
COPY definitions definitions

# Build Application
RUN yarn -v && yarn && yarn build

ENTRYPOINT yarn migrate:up && node -r dotenv/config dist/ebs.js

EXPOSE 3000