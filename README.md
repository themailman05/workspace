# Popcorn

- [Popcorn](#popcorn)
  - [Technology Used](#technology-used)
  - [Directory structure](#directory-structure)
  - [Getting started](#getting-started)
  - [Default Service Locations](#default-service-locations)
  - [Useful Commands](#useful-commands)
  - [Contributing](#contributing)

## Technology Used

* [Next.js](https://nextjs.org/)
* [Lerna](https://lerna.js.org)
* [Yarn](https://yarnpkg.com)
* [Storybook](https://storybook.js.org/)
* [GraphQL](https://graphql.org/)
* [React styled components](https://styled-components.com)
* [Solidity](https://soliditylang.org)
* [React testing library](https://testing-library.com/docs/react-testing-library/intro/)

## Directory structure

```
packages
├── app            [@popcorn/app]          [next.js]  
├── contracts      [@popcorn/contracts]    [solidity contracts]
├── scripts        [@popcorn/scripts]      [deploy scripts, etc]
├── utils          [@popcorn/utils]        [generic utils]
├── ui             [@popcorn/ui]           [ui components + storybook]
└── ... etc
```

## Getting started

1. Install packages
   * `yarn install`

2. Run dev (watch files and start up frontend)
   *  `yarn lerna run dev  --parallel`

3. Start storybook:
   * `yarn lerna run story`


## Default Service Locations 

| Service          | Location                      |
| ---------------- | ----------------------------- |
| Next.js Frontend | http://localhost:3000         |
| Storybook        | run: `yarn lerna run story`   |

## Useful Commands

| Command                                     | Description                                                          |
| ------------------------------------------- | -------------------------------------------------------------------- |
| `yarn install`                              | equivalent to `npm install`                                          |
| `yarn add @org/packagename`                 | equivalent to `npm install` - will add to dependencies               |
| `yarn add @org/packagename -D`              | equivalent to `npm install --save-dev` - will add to devDependencies |
| `lerna dev  --parallel`                  | run package.json "dev" script on all projects                        |
| `lerna run dev  --scope=@popcorn/app` | run package.json "dev" script only on frontend package               |
| `lerna run story`                      | start storybook                                                      |
| `lerna run test --parallel`            | run tests                                                            |


## Contributing
Contributions are welcome! Please raise a pull request with your contributions.

Popcorn follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/1/4/code-of-conduct).