FROM node:8-alpine
RUN mkdir -p /usr/src/MiddleLayer
WORKDIR /usr/src/MiddleLayer
COPY package.json /usr/src/MiddleLayer/
RUN npm install
COPY . /usr/src/MiddleLayer
#EXPOSE 3000
RUN npm run build
#RUN cd build
WORKDIR /usr/src/MiddleLayer/build
CMD [ "node", "MainController.js" ]