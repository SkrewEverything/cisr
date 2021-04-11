import { CISRPrompt } from "./CISRPrompt";
import Enquirer from "enquirer";
import Listr from "listr";
import execa from "execa";
import File from "../File";

/**
 * Prompt specifically for JSON config files.
 * Extends abstract class `CISRPrompt`
 *
 * @export
 * @class JSONPrompt
 * @extends {CISRPrompt}
 */
export class JSONPrompt extends CISRPrompt {
  private options: any;

  /**
   *Creates an instance of JSONPrompt.
   * @param {*} options options to pass to create prompt and pass it to the underlying `Enquirer.js`
   * @memberof JSONPrompt
   */
  private constructor(options: any) {
    const prompts = options.prompts.map((propmt: any) => {
      const promptType = JSONPrompt.captaliseFirstLetter(propmt.type);
      return new Enquirer.prompts[promptType](propmt);
    });

    super(options.name, prompts);
    this.options = options;
  }

  // ! NOTE: `this` is not allowed before calling super(), so method is made static
  /**
   * Capatalises first character in the string
   *
   * @private
   * @static
   * @param {string} data String to captalise the first letter
   * @return {string} String with a first letter captalised
   * @memberof JSONPrompt
   */
  private static captaliseFirstLetter(data: string): string {
    return data.charAt(0).toUpperCase() + data.slice(1).toLowerCase();
  }

  public async runCommand() {
    const { message, file, args } = this.options.command;
    let commandArgs = this.getCommandArgs();

    // args is an array of predefined flags. If exists, append it.
    if (args && args.constructor === Array) {
      commandArgs = [...args, ...commandArgs];
    }
    console.log("command to run: ", file, commandArgs);
    const tasks = new Listr([
      {
        title: message,
        task: async () => {
          try {
            const { stdout } = await execa(file, commandArgs);
            console.log("Output from the command: ", stdout);
          } catch (e) {
            const error = e.message;
            throw new Error(error);
          }
        },
      },
    ]);

    try {
      await tasks.run();
    } catch (e) {}
  }

  /**
   * Constructs an array of strings by appending flag + answer
   *
   * @private
   * @return {string[]} array of strings by appending flag + answer
   * @memberof JSONPrompt
   */
  private getCommandArgs(): string[] {
    const { appendFlagName, appendWith } = this.options.command;
    const commandArgs: string[] = [];

    Object.keys(this.answers).forEach((flag, index) => {
      const shouldAppendFlagName = this.shouldAppendFlagName(
        appendFlagName,
        this.options.prompts[index].appendFlagName
      );

      if (shouldAppendFlagName) {
        // If it is a space, then we just split it into args instead of concat.
        if (typeof appendWith !== "undefined" && appendWith !== " ")
          commandArgs.push(flag + appendWith + this.answers[flag]);
        // This is to decide whether to include only flag or not
        else if (typeof this.answers[flag] === "boolean")
          commandArgs.push(flag);
        else {
          commandArgs.push(flag);
          commandArgs.push(this.answers[flag]);
        }
      } else commandArgs.push(this.answers[flag]);
    });

    return commandArgs;
  }

  /**
   * Checks global and local preference of appending a flag name.
   * Local preference has higher priority if specified.
   *
   * @private
   * @param {boolean} globalPref `appendFlagName` in `command` key
   * @param {(boolean | undefined)} localPref `appendFlagName` in `prompts` objects key
   * @return {boolean}
   * @memberof JSONPrompt
   */
  private shouldAppendFlagName(
    globalPref: boolean,
    localPref: boolean | undefined
  ): boolean {
    if (typeof localPref !== "undefined") return localPref;
    return globalPref;
  }

  /**
   * Checks whether a JS Object is a valid JSON Prompt qualified object or not
   *
   * Checks for certain required fields to decide
   *
   * @private
   * @static
   * @param {*} jsonObj JS Object of parsed JSON.
   * @return {boolean} True if it is a valid JSON Prompt qualified object
   * @memberof JSONPrompt
   */
  private static isValidJSON(jsonObj: any): boolean {
    const requiredRootFields = ["name", "command", "prompts"];
    const requiredCommandFields = ["file", "message"];
    const requiredPromptFields = ["name", "message", "type"];

    const isRootFieldsValid = JSONPrompt.areKeysMatched(
      requiredRootFields,
      jsonObj
    );
    if (!isRootFieldsValid) return false;

    // command key is an object itself
    const isCommandFieldsValid = JSONPrompt.areKeysMatched(
      requiredCommandFields,
      jsonObj.command
    );
    if (!isCommandFieldsValid) return false;

    // prompts key is an array of objects.
    // So, check for each array object.
    const isPromptFieldsValid = jsonObj.prompts.every((promptObj: any[]) =>
      JSONPrompt.areKeysMatched(requiredPromptFields, promptObj)
    );

    if (!isPromptFieldsValid) return false;

    return true;
  }

  /**
   * Takes two objects and checks whether `requiredFields` are all present in `jsonObject`
   *
   * @private
   * @static
   * @param {string[]} requiredFields List of keys that are required
   * @param {*} jsonObject Object to check the keys of against `requiredFields`
   * @return {boolean} True if `requiredFields` are all present in `jsonObject`. Otherwise, false.
   * @memberof JSONPrompt
   */
  private static areKeysMatched(
    requiredFields: string[],
    jsonObject: any
  ): boolean {
    return requiredFields.every((requiredField) =>
      Object.keys(jsonObject).includes(requiredField)
    );
  }

  /**
   * Checks whether a JSON/HJSON file is a valid file for creating JSONPrompt
   *
   * @static
   * @param {string} pathToJson Absolute path to JSON/HJSON file
   * @return {(Promise<JSONPrompt | null>)} List of JSONPrompts or null if none found
   * @memberof JSONPrompt
   */
  public static async checkAndCreatePrompt(
    pathToJson: string
  ): Promise<JSONPrompt | null> {
    const options = await File.readJSONFile(pathToJson);

    if (JSONPrompt.isValidJSON(options)) {
      return new JSONPrompt(options);
    }
    return null;
  }
}
