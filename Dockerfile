FROM node:lts-alpine as build-stage
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
 
FROM node:lts-alpine as production-stage
RUN apk add --no-cache tini

WORKDIR /app
COPY --from=build-stage /build/dist/ dist/
COPY package.json package-lock.json ./
RUN npm ci --omit-dev

USER node
ENV NODE_ENV=production
# ENV HUE_IP=192.168.1.107
# ENV HUE_USERNAME=xxx
# ENV MONGO_HOST=127.0.0.1:27017
# ENV DATASTORE_HOST=mongodb:port
EXPOSE 5173

ENTRYPOINT ["/sbin/tini", "--"]
CMD [ "node", "--experimental-specifier-resolution=node", "./dist/express/server.js" ]