# gap-web-ui

## Using the library in another repo

On your local branch for gap-web-ui, push any changes you want to use in the other repo then

- run `yarn prepack` to build the components
- run `yarn link `
- this will give you a command to run in your another repo `yarn link "gap-web-ui"`

## Using story book

- run `yarn install` when using it for the first time
- run `yarn run storybook`
