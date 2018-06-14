FROM node:8
RUN mkdir -p /usr/src/DeviceSimulator
WORKDIR /usr/src/DeviceSimulator
COPY package.json /usr/src/DeviceSimulator/
RUN npm install
COPY . /usr/src/DeviceSimulator
WORKDIR /usr/src/DeviceSimulator/static_data
#download the proto file
RUN curl https://raw.githubusercontent.com/caribewave/mambo-devices-proto/master/weather-davis-vantage-vue.proto -o data.proto
RUN npm run build
WORKDIR /usr/src/DeviceSimulator/build
CMD [ "node", "controller.js" ]