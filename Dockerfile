FROM node:12
ENV NODE_ENV production
WORKDIR ./
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 8080
CMD [ "node", "/src/server.js" ] 