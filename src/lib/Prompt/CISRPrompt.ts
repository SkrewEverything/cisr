export abstract class CISRPrompt {
  public answers: any;
  private prompt: any[];
  readonly name: string;

  /**
   *Creates an instance of CISRPrompt.
   * @param {string} name Name to display for your category. Should be unique in the list.
   * @param {any[]} prompt Array of Enquirer.js prompts
   * @memberof CISRPrompt
   */
  constructor(name: string, prompt: any[]) {
    this.prompt = prompt;
    this.name = name;
    this.answers = {};
  }

  /**
   * Runs all the prompts.
   *
   * **NOTE:** DON'T OVERRIDE THIS!
   * The default behaviour enables the core library to run the prompts in the subclasses.
   *
   * @return {Promise<void>}
   * @memberof CISRPrompt
   */
  // TODO: Unlike Java, Typrescript doesn't has `final` keyword to prevent ovveriding of public methods
  // TODO: At the time of writing, there is no such thing in Typescript, if an update comes, update this.
  public async run(): Promise<void> {
    await this.runEachPrompt();
  }

  /**
   * This runs each prompt present in the `this.prompt` array.
   * After each successful prompt, the answer is stored in the `this.answers` property.
   *
   * @private
   * @memberof CISRPrompt
   */
  private async runEachPrompt(): Promise<void> {
    const answers: any = {};

    for (let i = 0; i < this.prompt.length; i++) {
      const fieldName = this.prompt[i].name ?? Object.keys(answers).length;
      const answer = await this.prompt[i].run();
      // console.log("Field Name: ", fieldName);
      answers[fieldName] = answer;
    }

    this.answers = answers;
  }

  /**
   * After runnning the prompt and getting all the answers,
   * this method is executed.
   *
   * This method should have the user logic which will be run
   * after all the questions are answered.
   *
   * Use `this.answers` property to access the answers to your questions
   * To access your answers, use the following notation `this.answers[prompt_name]`
   *
   * @abstract
   * @memberof CISRPrompt
   */
  abstract runCommand(): Promise<void>;
}
