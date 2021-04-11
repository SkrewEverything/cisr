const { Input, Password } = require("enquirer");
// ! Although, this file is plain JS, it imports from .ts file.
// ! So, it produces error in production.
const { CISRPrompt } = require("../lib");
const execa = require("execa");
const Listr = require("listr");

class Question extends CISRPrompt {
  constructor() {
    const prompt1 = [
      new Input({
        message: "What is your username?",
        name: "username",
        initial: "jonschlinkert",
      }),
      new Password({
        message: "Enter Password",
        name: "Password",
      }),
    ];
    super("Test one", prompt1);
  }

  async runCommand() {
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

module.exports = Question;
