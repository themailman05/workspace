# Lerna monorepo for Typescript codebase with tsconfig-paths + Lerna + symlinks

Monorepo consists of 5 packages:

- [@popcorn/app](./packages/app) - this is a NextJS react application
- [@popcorn/contracts](./packages/contracts) - ethereum smart contracts
- [@popcorn/scripts](./packages/scripts) - deploy scripts, etc.
- [@popcorn/utils](./packages/utils) - general utilities
- [@popcorn/ui](./packages/ui) - storybook for UI components

Install it and run:

Development:

```bash
yarn
cd packages/app
yarn dev
```

Production:

```bash
yarn
yarn app:build
cd packages/app
yarn start
```