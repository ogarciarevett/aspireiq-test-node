# Stage 1 - the build process
FROM node:14.15 as compile-server
WORKDIR /usr/src/app
COPY . .
RUN npm install

CMD [ "npm", "test" ]