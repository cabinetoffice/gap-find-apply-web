ARG NODE_VERSION=18.17.0
FROM --platform=linux/amd64 node:${NODE_VERSION}-alpine as build

ARG APP_NAME

WORKDIR /usr/src/app

COPY package.json .
COPY packages ./packages
COPY .yarnrc.yml .
COPY .yarn ./.yarn

ENV CI true
ENV SUB_PATH /apply/${APP_NAME}

RUN yarn install --immutable

RUN yarn workspace gap-web-ui build

RUN yarn workspace ${APP_NAME} build

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
COPY --from=build /usr/src/app/packages/${APP_NAME}/.env.example /usr/src/app/packages/${APP_NAME}/.env
COPY --from=build /usr/src/app/packages/${APP_NAME}/next.config.js /usr/src/app/packages/${APP_NAME}/next.config.js
COPY --from=build /usr/src/app/packages/${APP_NAME}/next-logger.config.js /usr/src/app/packages/${APP_NAME}/next-logger.config.js
COPY --from=build /usr/src/app/packages/${APP_NAME}/.next /usr/src/app/packages/${APP_NAME}/.next
COPY --from=build /usr/src/app/packages/${APP_NAME}/public /usr/src/app/packages/${APP_NAME}/public
# use glob pattern to copy file only if it exists, without throwing an error
COPY --from=build /usr/src/app/packages/${APP_NAME}/postinstall.j[s] /usr/src/app/packages/${APP_NAME}/postinstall.js

ENV NODE_ENV production
ENV CI true

RUN yarn workspaces focus ${APP_NAME} --production

WORKDIR /usr/src/app/packages/${APP_NAME}

CMD ["yarn", "start"]