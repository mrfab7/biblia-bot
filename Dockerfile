FROM node:24

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

USER node

ENV NODE_ENV=production

CMD ["npm", "start"]