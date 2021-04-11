import { AutoComplete, MultiSelect } from "enquirer";
import { CISRPrompt } from "../lib";
import execa from "execa";
import Listr from "listr";
import chalk from "chalk";

export default class Question extends CISRPrompt {
  constructor() {
    const prompt1 = [
      new AutoComplete({
        name: "flavor",
        message:
          chalk.white.bold("Pick your favorite flavor ") +
          chalk.gray("<start typing to narrow the list>"),
        limit: 10,
        initial: 2,
        choices: [
          "Almond",
          "Apple",
          "Banana",
          "Blackberry",
          "Blueberry",
          "Cherry",
          "Chocolate",
          "Cinnamon",
          "Coconut",
          "Cranberry",
          "Grape",
          "Nougat",
          "Orange",
          "Pear",
          "Pineapple",
          "Raspberry",
          "Strawberry",
          "Vanilla",
          "Watermelon",
          "Wintergreen",
        ],
      }),
      new MultiSelect({
        name: "colors",
        message:
          chalk.white.bold("Pick your favorite colors ") +
          chalk.gray(
            "<press i to toggle all, press space to select, enter to confirm>"
          ),
        limit: 7,
        choices: [
          { name: "aqua", value: "#00ffff" },
          { name: "black", value: "#000000" },
          { name: "blue", value: "#0000ff" },
          { name: "fuchsia", value: "#ff00ff" },
          { name: "gray", value: "#808080" },
          { name: "green", value: "#008000" },
          { name: "lime", value: "#00ff00" },
          { name: "maroon", value: "#800000" },
          { name: "navy", value: "#000080" },
          { name: "olive", value: "#808000" },
          { name: "purple", value: "#800080" },
          { name: "red", value: "#ff0000" },
          { name: "silver", value: "#c0c0c0" },
          { name: "teal", value: "#008080" },
          { name: "white", value: "#ffffff" },
          { name: "yellow", value: "#ffff00" },
        ],
      }),
    ];
    super("Test two", prompt1);
  }

  public async runCommand(): Promise<void> {
    console.log("Run command Answers: ", this.answers);
    execa("echo", ["testing"]).stdout?.pipe(process.stdout);

    const tasks = new Listr([
      {
        title: "Success",
        task: async () => {
          await execa("echo", Object.values(this.answers));
          await execa("touch", ["temp.txt"]);
          return;
        },
      },
      {
        title: "Waits for command to finish",
        task: async () => {
          const p = new Promise((res, rej) => {
            setTimeout(() => {
              res(0);
            }, 5000);
          });
          await p;

          return;
        },
      },
      {
        title: "Failure",
        task: () => {
          throw new Error("Bar");
        },
      },
    ]);

    try {
      await tasks.run();
    } catch (e) {}
  }
}
