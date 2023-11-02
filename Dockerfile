ARG NODE_VERSION=16.14.0
FROM --platform=linux/amd64 node:${NODE_VERSION}-alpine AS build

ARG APP_NAME

WORKDIR /app

COPY package.json yarn.lock ./
COPY packages/gap-web-ui ./packages/gap-web-ui
COPY packages/${APP_NAME} ./packages/${APP_NAME}

ENV CI true
ENV SUB_PATH /apply/${APP_NAME}

RUN yarn install --immutable

RUN yarn workspace gap-web-ui build

RUN yarn workspace ${APP_NAME} build

FROM --platform=linux/amd64 node:${NODE_VERSION}-alpine

ARG APP_NAME

WORKDIR /app

COPY yarn.lock ./
COPY package.json ./

COPY --from=build /app/packages/${APP_NAME}/package.json ./packages/${APP_NAME}/
COPY --from=build /app/packages/${APP_NAME}/.env.example ./packages/${APP_NAME}/.env
COPY --from=build /app/packages/${APP_NAME}/next.config.js ./packages/${APP_NAME}/
COPY --from=build /app/packages/${APP_NAME}/next-logger.config.js ./packages/${APP_NAME}/
COPY --from=build /app/packages/${APP_NAME}/.next/standalone ./
COPY --from=build /app/packages/${APP_NAME}/.next/static ./packages/${APP_NAME}/.next/static
COPY --from=build /app/packages/${APP_NAME}/public ./packages/${APP_NAME}/public

ENV NODE_ENV production
ENV CI true

EXPOSE 3000

WORKDIR /app/packages/${APP_NAME}

ENTRYPOINT ["node", "server.js"]