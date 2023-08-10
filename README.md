# GAP Apply - Web Packages

This repository holds all web projects required for the GAP journeys related to grant applications.

All commands mentioned below are relative to the root of the repository - no need to change directory to run a command.

## Packages

- admin - covers the journeys related to managing schemes, grant application forms, etc
- applicant - covers the journeys related to creating a submission for a published grant applicantion form
- gap-web-ui - a set of components shared across both sets of journeys

## Getting Started

- install packages - `yarn install`
- run a set of journeys
  - (make sure the appropriate backend is started)
  - admin - `yarn workspace admin dev`
  - applicant - `yarn workspace applicant dev`

## Building Locally

- run a production build - `yarn build`
- run a set of journeys
  - (make sure the appropriate backend is started)
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

## Cypress Tests

Both admin and applicant packages have cypress test suites.

These are designed to run against a local environment. The following apps must be running:

`user-service`
`wiremock (located in user-service/mockOneLogin)`
`gap-find-apply-web (admin/applicant)`
`gap-find-admin-backend`
`gap-find-applicant-backend`

### Cypress environment variables can be set to align with local environment (defaults provided)

`CYPRESS_WIREMOCK_BASE_URL=http://localhost:8888/__admin`
`CYPRESS_DATABASE_URL=postgres://postgres:postgres@localhost:5432`
`CYPRESS_USER_SERVICE_DB_NAME=gapuserlocaldb`

The package.json within admin/applicant includes shorthands to run:

- `yarn workspace admin integration:gui` - run individual test cases against browser
- `yarn integration` - runs all tests in headless mode

### Data teardown/setup

A database layer has been added to natively run sql against any database used by the app (`seed/database.js`).

A function (`runSQL(filePath, dbName)`) can be called to do this.

It is recommended that data teardown/setup happens as part of each test run ensuring every test is repeatable

### Cypress tasks

Various tasks have been added to perform tasks before and during test runs. These can be found in `cypress/plugins/index.js`

`setup:user`

- this will remove test users directly to the database via sql
- this will add test users directly to the database via sql
- this will edit the wiremock stub mapping to One login (/userInfo) to return either an applicant, admin or super-admin. This will act as the signed in user to perform the test actions
