This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

This directory holds the frontend code for the GAP Applicant Apply service created by The Cabinet Office.

## Getting Started

First, install all the node modules from package.json:

```bash
yarn install
```

Then, start the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Running in Production Mode

To get a CSRF token the app requires AWS credentials - the `IS_PRODUCTION` flag in `constants.ts` determines whether an endpoint that allows the middleware to fetch credentials from the filesystem is enabled. To run the app in production mode locally you'll need to edit the value of this flag to `false` to allow the app to fetch credentials from the local filesystem. 

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
