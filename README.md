# GAP Apply - Web Packages

This repository holds all web projects required for the GAP journeys related to grant applications.

All commands mentioned below are relative to the root of the repository - no need to change directory to run a command.

## Packages

- admin - covers the journeys related to managing schemes, grant application forms, etc
- applicant - covers the journeys related to creating a submission for a published grant application form
- gap-web-ui - a set of components shared across both sets of journeys

## Getting Started

- install packages - `yarn install`
- run `yarn build` to rollup gap-web-ui components (required whenever gap-web-ui changes)
- run a set of journeys
  - (make sure the appropriate backend is started)
  - (make sure user-service is running)
  - admin - `yarn workspace admin dev`
  - applicant - `yarn workspace applicant dev`

## Building Locally

- run a production build - `yarn build`
- run a set of journeys
  - (make sure the appropriate backend is started)
  - (make sure user-service is running)
  - admin - `yarn workspace admin start`
  - applicant - `yarn workspace applicant start`

## Building Container Image

There's one dockerfile that can be used to build the appropriate application. For example, `docker build --build-arg APP_NAME=admin -t admin:latest .` will build the admin package (and tag it with the tag admin:latest). Replacing admin with applicant would build the applicant package instead.

The package.json includes shorthands for this:

- `yarn build:image:admin`
- `yarn build:image:applicant`

## Authentication

Going forward all API requests will require authentication. That is taken care of automatically through a user session once initial authentication is kicked off. To authenticate the session one needs to go to the application's root URL (base url plus subpath). e.g., `http://localhost:3000/apply/admin`. If the request has correct headers it will authenticate the session for a duration. Said duration will be refreshed with each successful request made (and expire after a time of inactivity).

For development locally a back-end set up is also preferred. Refer to admin back-end README file for instructions.

## Testing

Jest has been configured to contain run files per package. These can be ran in various ways:

- Run all packages tests in watch mode: `yarn test`
- Run specific packages tests in watch mode:
  - `yarn test:admin`
  - `yarn test:applicant`
  - `yarn test:gap-web-ui`
- Run tests without watch mode: `yarn jest --selectProjects admin`
- Run with coverage report: `yarn jest --selectProjects applicant --coverage`

To mock a dependency before every single test, add the code to `setupJestMock.js`
To mock an env var before every single test, append it to `setupJestEnv.js`
