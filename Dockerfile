FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production \
    GCOS_SERVE_WEB=1 \
    GCOS_HOST=0.0.0.0 \
    GCOS_WEB_DIST_PATH=dist

CMD ["npm", "run", "start:firebase"]
