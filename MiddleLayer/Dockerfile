FROM node:8-alpine
RUN mkdir -p /usr/src/MiddleLayer
WORKDIR /usr/src/MiddleLayer
COPY package.json /usr/src/MiddleLayer/
RUN npm install
COPY . /usr/src/MiddleLayer
RUN npm run build
#RUN cd build
EXPOSE 60000
WORKDIR /usr/src/MiddleLayer/build
CMD [ "node", "MainController.js" ]