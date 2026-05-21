FROM node:22-slim

WORKDIR /app
ARG GCOS_BUILD_COMMIT=unknown
ARG GCOS_BUILD_BRANCH=main

COPY package*.json ./
RUN npm ci

COPY . .
RUN GCOS_BUILD_COMMIT=$GCOS_BUILD_COMMIT GCOS_BUILD_BRANCH=$GCOS_BUILD_BRANCH npm run build

ENV NODE_ENV=production \
    GCOS_SERVE_WEB=1 \
    GCOS_HOST=0.0.0.0 \
    GCOS_WEB_DIST_PATH=dist

CMD ["npm", "run", "start:firebase"]
