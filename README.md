# DDevLib
A TypeScript and SCSS library.

#### TypeScrip
The typescript library contains simple to use modules for simple repettitive tasks faced when creating a web app.
Read more about [TypeScript](https://www.typescriptlang.org/).

#### SCSS
Styles written in scss are easier to read and maintain (in my opinion).
Only simple styling is applied to common elements. Some themes are available.
Read more about [SCSS and SASS](https://sass-lang.com/).

## Setup

#### Basic setup
1. Copy the contents of "/src" into the html root of your project.
2. Configure your TypeScript compiler
3. Configure your SCSS compiler
4. Done

#### Not using TypeScript and/or SCSS?
No worries, both the typescript and the scss have been compiled beforehand and is ready for use.
1. Do not configure their compilers
2. Delete the "/src/ts" folder if not using TypeScript
3. Delete the "/src/scss" folder if not using SCSS

#### How to configure the TypeScript compiler
Typescript compilers look for a file named tsconfig.json when compiling.
This file contains the settings used in compilation.
A simple tsconfig.json would be:
```json
{
  "compilerOptions": {
    "target": "<ES3|ES5|ES2015|ES2016|ES2017|ES2018|ESNext>",
    "module": "esnext",
    "outDir": "<your-web-directory>/js/",
    "rootDir": "<your-web-directory>/ts/",
    "strict": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "declaration": true
  }
}
```

## License
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)