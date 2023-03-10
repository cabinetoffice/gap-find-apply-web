ARG NODE_VERSION=16.14.0
FROM --platform=linux/amd64 node:${NODE_VERSION}-alpine as build

ARG APP_NAME

WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .
COPY .yarnrc.yml .
COPY .yarn ./.yarn
COPY packages/gap-web-ui ./packages/gap-web-ui
COPY packages/${APP_NAME} ./packages/${APP_NAME}

ENV CI true
ENV SUB_PATH /apply/${APP_NAME}

RUN yarn workspaces focus ${APP_NAME}

RUN yarn build

FROM --platform=linux/amd64 node:${NODE_VERSION}-alpine

ARG APP_NAME

WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .
COPY .yarnrc.yml .
COPY .yarn ./.yarn

COPY --from=build /usr/src/app/packages/gap-web-ui/package.json /usr/src/app/packages/gap-web-ui/package.json
COPY --from=build /usr/src/app/packages/gap-web-ui/dist /usr/src/app/packages/gap-web-ui/dist

COPY --from=build /usr/src/app/packages/${APP_NAME}/package.json /usr/src/app/packages/${APP_NAME}/package.json
COPY --from=build /usr/src/app/packages/${APP_NAME}/.env /usr/src/app/packages/${APP_NAME}/.env
COPY --from=build /usr/src/app/packages/${APP_NAME}/next.config.js /usr/src/app/packages/${APP_NAME}/next.config.js
COPY --from=build /usr/src/app/packages/${APP_NAME}/next-logger.config.js /usr/src/app/packages/${APP_NAME}/next-logger.config.js
COPY --from=build /usr/src/app/packages/${APP_NAME}/.next /usr/src/app/packages/${APP_NAME}/.next
COPY --from=build /usr/src/app/packages/${APP_NAME}/public /usr/src/app/packages/${APP_NAME}/public

ENV NODE_ENV production
ENV CI true

RUN yarn workspaces focus ${APP_NAME} --production

WORKDIR /usr/src/app/packages/${APP_NAME}

CMD ["yarn", "start"]