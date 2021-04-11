# Getting Started

It is a guide to how to setup a development environment for this project.

## Libraries used

| Name                                                	| For what it is used                                                                   	|
|-----------------------------------------------------	|---------------------------------------------------------------------------------------	|
| [Enquirer.js](https://github.com/enquirer/enquirer) 	| For displaying prompts, taking inputs                                                 	|
| [Boxen](https://github.com/sindresorhus/boxen)      	| For welcome box in terminal                                                           	|
| [hjson](https://www.npmjs.com/package/hjson)        	| Allows comments in the JSON files and much more. Check out its page for more features 	|
| [Chalk](https://github.com/chalk/chalk)             	| For text styling                                                                      	|
| [Listr](github.com/SamVerschueren/listr)            	| To display the status of multiple commands for `JSONPrompt`                                         	|
| [Execa](https://github.com/sindresorhus/execa)      	| For running the commands                                                              	|
| [Data-Store](github.com/jonschlinkert/data-store)   	| For storing user data like welcome message and config directory location              	|

## Libraries used for development

| Name                                                           	| For what it is used                                                                                                                  	|
|----------------------------------------------------------------	|--------------------------------------------------------------------------------------------------------------------------------------	|
| [ts-node-dev](https://github.com/wclr/ts-node-dev)             	| Compiles TS app and restarts when files are modified.                                                                                	|
| [ts-jest](github.com/kulshekhar/ts-jest)                       	| A TypeScript preprocessor with source map support for Jest that lets you use Jest to test projects written in TypeScript.            	|
| [cross-env](https://github.com/kentcdodds/cross-env#readme)    	| Makes it so you can have a single command without worrying about setting or using the environment variable properly for the platform 	|
| [Jest](jestjs.io/)                                             	| Testing Framework                                                                                                                    	|
| [TypeScript](www.typescriptlang.org/)                          	| TypeScript is a language for application-scale JavaScript.                                                                           	|
| [Prettier](https://prettier.io/)                               	| Prettier is an opinionated code formatter.                                                                                           	|
| [Eslint](https://eslint.org/)                                  	| ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.                                      	|
| [eslint-config-google](github.com/google/eslint-config-google) 	| This project uses Google style guide for eslint                                                                                      	|

## npm scripts
- **`npm run install_pkg`**: Compiles and install the package globally using `npm link`.
- **`npm run build`**: Compiles the ts code into js code and saves into `dist` folder.
- **`npm run dev`**: Restarts the app automatically after editing while developing. 
- **`npm test`**: Runs available tests.


## Node version
Minimum node version required is **`12`** due to the usage of file promises.

## Project Directory

```
├── bin
│   └── index.ts
├── examples
└── lib
    ├── File
    │   ├── __tests__
    │   └── index.ts
    ├── Prompt
    │   ├── CISRPrompt.ts
    │   ├── JSONPrompts.ts
    │   ├── SettingsPrompt.ts
    │   ├── __tests__
    │   └── runner.ts
    ├── index.ts
    └── types

```

**`bin`**: It has the main file which runs the cisr for binary executable. This can be used to test the working of cisr while working.

**`examples`**: It has examples of how to write JSON, TS and JS files for cisr.

**`lib`**: It has the library's core functionality files.

- *`index.ts`*: It has required named exports to use this framework.
- **`File`**: It handles reading the filenames and getting paths of config files for cisr.
- **`Prompt`**: It has the prompt base files.
        - *`CISRPrompt.ts`*: It is the abstract class which is used to create custom prompts for cisr.
        - *`JSONPrompts.ts`*: It implements the `CISRPrompt` for JSON config files.
        - *`SettingsPrompt.ts`*: It implements the `CISRPrompt` for Settings prompt.
        - *`runner.ts`*: It is the driver code of cisr. It filters and initiates the appropriate prompts based on the config files.
- **`types`**: It has types file for enquirer.js as it doesn't provide typescript support yet. To suppress the errors, a dummy type file is created without any actual types.



