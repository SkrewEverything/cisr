#! /usr/bin/env node

import { startRunner } from "../lib";
import chalk from "chalk";

(async () => {
  try {
    await startRunner();
  } catch (e) {
    // If program stopped using cmd+c or ctrl+c, `e` is empty
    if (e) console.log("Error: ", e);
    else console.log(chalk.bold.red("Bye!"));
  }
})();
