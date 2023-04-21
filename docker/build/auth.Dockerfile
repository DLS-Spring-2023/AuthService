FROM node:18.16.0-alpine3.17

RUN mkdir -p /usr/src/

WORKDIR /usr/src/

COPY /auth/ /usr/src/

RUN npm ci
RUN npm run build
CMD ["npm", "start"]