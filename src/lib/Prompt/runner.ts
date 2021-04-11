/**
 * If anyone is confused on why this file has functions instead of classes(for consistency),
 *
 * "Sometimes the elegant implementation is a function.
 *  Not a method.
 *  Not a class.
 *  Not a framework.
 *  Just a function." – John Carmack
 *
 * Or, I wrote this file at 2 A.M feeling dehydrated, sleep-deprived and too tired to design classes...
 *
 */
import { Select } from "enquirer";
import boxen from "boxen";
import chalk from "chalk";
import store from "data-store";
import { CISRPrompt } from "./CISRPrompt";
import File from "../File";
import { SettingsPrompt } from "./SettingsPrompt";
import { JSONPrompt } from "./JSONPrompts";
import path from "path";

// Default store name
const storeName: string =
  process.env.NODE_ENV === "development" ? "cisr-dev" : "cisr";

export type StartOptions = {
  welcomeMessage?: string;
  absolutePathToScriptsDir?: string;
};

/**
 * Starts the CISR Prompt in an asynchronous loop.
 *
 * @export
 * @param {StartOptions} [options] Config parameter for CISR Prompt
 */
export async function startRunner(options?: StartOptions): Promise<void> {
  createDataStoreDefaults(options);

  let storeObj = { ...store(storeName).data };
  let allPrompts: CISRPrompt[] = [];

  displayWelcomeBanner();

  // # Running the prompt in a continuous loop
  while (true) {
    if (areSettingsChanged(storeObj)) {
      displaySettingsUpdateBanner();
      storeObj = { ...store(storeName).data };
    }

    allPrompts = await initAndGetAllPrompts();

    const categoriesTextToDisplay = allPrompts.map((p) => p.name);

    const selectPrompt = new Select({
      name: "Initial Selection View",
      message: "Choose the command/script to start",
      choices: [
        ...categoriesTextToDisplay,
        { message: "\n  ++++++++", role: "separator" },
        "Settings",
        "Exit",
      ],
    });

    const selectedCategoryName = await selectPrompt.run();
    let selectedCategoryInstance: CISRPrompt;

    if (selectedCategoryName === "Exit") {
      console.log(chalk.bold.red("Bye!"));
      break;
    } else if (selectedCategoryName === "Settings") {
      selectedCategoryInstance = new SettingsPrompt();
    } else {
      selectedCategoryInstance = allPrompts.find(
        (p) => p.name === selectedCategoryName
      ) as CISRPrompt;
    }

    // Trivial check because `allPrompts` always has the selected category.
    // Check exists to stop the Typescript error
    if (selectedCategoryInstance) {
      await selectedCategoryInstance.run();
      await selectedCategoryInstance.runCommand();
    }
  }
}

/**
 * Initializes all the prompts present in the config directory.
 *
 * @return {Promise<CISRPrompt[]>} Returns all the instantiated `CISRPrompt` instances
 */
async function initAndGetAllPrompts(): Promise<CISRPrompt[]> {
  const configDir = getConfigDirPath();
  let allPrompts: CISRPrompt[] = [];
  let listOfFiles: string[] = [];

  if (configDir) listOfFiles = await getAllFilesFromConfigDir(configDir);

  const jsFiles = fileterJSFiles(listOfFiles);

  const jsonFiles = fileterJSONFiles(listOfFiles);

  const listOfJSONPrompts = await initAndGetJSONPrompts(jsonFiles);

  const listOfJSPrompts = await initAndGetJSPrompts(jsFiles);

  allPrompts = [...listOfJSONPrompts, ...listOfJSPrompts];

  return allPrompts;
}

/**
 * Path stored in the data-store to the config directory.
 *
 * @return {(string | null)} Path if present, otherwise null
 */
function getConfigDirPath(): string | null {
  const storeObj = store(storeName);

  if (storeObj.has("dir") && storeObj.get("dir").length > 0)
    return storeObj.get("dir");
  else return null;
}

/**
 * Scans the config directory for config files
 *
 * @param {string} pathToDir Path to the config directory
 * @return {Promise<string[]>} Array of absolute paths to the files
 */
async function getAllFilesFromConfigDir(pathToDir: string): Promise<string[]> {
  const fileSystem = new File(pathToDir);
  const listOfFiles = await fileSystem.getAbsolutePathToAllFilesInTheDirectory();
  return listOfFiles;
}

/**
 * In development, TypeScript files are handled, if the files are present in the project directory.
 * Otherwise, syntax error is caused.
 * Because ts-node-dev automatically handles TS files in the project directory.
 *
 * In production, TypeScript is not avoided.
 *
 * @param {string[]} listOfFiles list of all the files with extension
 * @return {string[]} Returns list of files which has right extensions
 */
function fileterJSFiles(listOfFiles: string[]): string[] {
  if (process.env.NODE_ENV === "development") {
    return listOfFiles.filter(
      (fileName) => fileName.endsWith(".js") || fileName.endsWith(".ts")
    );
  } else {
    return listOfFiles.filter((fileName) => fileName.endsWith(".js"));
  }
}

/**
 * Filtering json and hjson files from a list of files
 *
 * @param {string[]} listOfFiles list of all the files with extension
 * @return {string[]} Returns list of files which has JSON/HJSON extension
 */
function fileterJSONFiles(listOfFiles: string[]): string[] {
  return listOfFiles.filter(
    (fileName) => fileName.endsWith(".json") || fileName.endsWith(".hjson")
  );
}

/**
 * Displays Welcome Banner on start-up
 */
function displayWelcomeBanner() {
  const configDir = getConfigDirPath();

  const message = store(storeName).get("message");
  const scriptsLocation = configDir
    ? chalk.cyanBright(configDir)
    : chalk.redBright("Go to settings and give the location to start");

  console.log(
    boxen(
      chalk.bold.rgb(57, 255, 20)("❯_ ") +
        chalk.bold.yellowBright(message) +
        "\n\n" +
        "Looking for config files in:  \n" +
        scriptsLocation,
      { padding: 1, align: "center" }
    )
  );
}

/**
 * Displays banner if settings are updated
 */
function displaySettingsUpdateBanner() {
  const configDir = getConfigDirPath();
  const message =
    store(storeName).get("message") ?? "Welcome to Interactive Script Runner";
  const scriptsLocation = configDir
    ? chalk.cyanBright(configDir)
    : chalk.redBright("Go to settings and give the location to start");

  console.log(
    boxen(
      chalk.bold.yellowBright("Settings Updated!") +
        "\n\n" +
        chalk.bold.rgb(57, 255, 20)("❯ ") +
        chalk.bold.yellowBright(message) +
        "\n\n" +
        "Looking for config files in:  \n" +
        scriptsLocation,
      { padding: 1, align: "center" }
    )
  );
}

/**
 * Initialize JSON prompts
 *
 * @param {string[]} pathToJsonFiles list of path files to json config files
 * @return {Promise<CISRPrompt[]>} Returns list of instances of json prompts
 */
async function initAndGetJSONPrompts(
  pathToJsonFiles: string[]
): Promise<CISRPrompt[]> {
  const allPrompts: CISRPrompt[] = [];

  // Using await inside the forEach doesn't wait.
  for (let i = 0; i < pathToJsonFiles.length; i++) {
    try {
      const instance: CISRPrompt | null = await JSONPrompt.checkAndCreatePrompt(
        pathToJsonFiles[i]
      );
      if (instance) allPrompts.push(instance);
    } catch (e) {
      console.log(
        chalk.bold.red("Error while initializing JSON config prompts: "),
        e
      );
    }
  }

  return allPrompts;
}

/**
 * Initialize JS prompts
 *
 * @param {string[]} pathToJSFiles list of path files to js config files
 * @return {Promise<CISRPrompt[]>} Returns list of instances of js prompts
 */
async function initAndGetJSPrompts(
  pathToJSFiles: string[]
): Promise<CISRPrompt[]> {
  const allPrompts: CISRPrompt[] = [];

  for (let i = 0; i < pathToJSFiles.length; i++) {
    // Sometimes the directory can cantain different files which won't have any default exports
    // Instead of crashing, it only reads the files with default exports
    try {
      const Prompt = (await import(pathToJSFiles[i])).default;
      const instance: CISRPrompt = new Prompt();

      // TODO: We need to check whether instance created is a type of CISRPrompt,
      // Because there can be unrelated JS files with default exports.
      // But doing instance instanceof CISRPrompt is always returning false.
      // So as a hack, checking whether the instance has certain properties before adding.
      if (instance.answers && instance.name) allPrompts.push(instance);
    } catch (e) {
      console.log(
        chalk.bold.red("Error while initializing JS config prompts: "),
        e
      );
    }
  }

  return allPrompts;
}

/**
 * Compares old and new state objects to check whether settings are changed
 *
 * @param {*} prevStoreObj Old state of the settings object
 * @return {boolean} Returns true if settings are changed
 */
function areSettingsChanged(prevStoreObj: any): boolean {
  const storeObj = store(storeName).data;
  return !Object.keys(storeObj).every(
    (key) => storeObj[key] === prevStoreObj[key]
  );
}

/**
 * Creates new store with default values
 *
 * @param {StartOptions} [options] Options to initialise the data store with
 */
function createDataStoreDefaults(options?: StartOptions) {
  const storeObj = store(storeName);
  const pathToScripts = options?.absolutePathToScriptsDir;
  const message =
    options?.welcomeMessage ?? "Welcome to Interactive Script Runner";

  if (!storeObj.has("message")) {
    storeObj.set("message", message);
  }

  if (!storeObj.has("dir") && pathToScripts) {
    storeObj.set("dir", path.resolve(pathToScripts));
  }
}
