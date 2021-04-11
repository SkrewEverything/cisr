// import fs from "fs/promises";
// # https://stackoverflow.com/questions/64725249/fs-promises-api-in-typescript-not-compiling-in-javascript-correctly
import { promises as fs } from "fs";
import path from "path";
import hjson from "hjson";

/**
 * Helper class to interact with the filesystem for cisr
 *
 * @export
 * @class File
 */
export default class File {
  private absolutePathToDirectory: string;

  /**
   * Creates an instance of File.
   * @param {string} pathToDirectory Absolute/Relative path to the directory
   * @memberof File
   */
  constructor(pathToDirectory: string) {
    const absolutePath = path.resolve(pathToDirectory);
    this.absolutePathToDirectory = absolutePath;
  }

  /**
   * Reads the contents of the directory for paths to files present in it
   *
   * @return {Promise<string[]>} List of absolute paths to the files in the directory
   * @memberof File
   */
  public async getAbsolutePathToAllFilesInTheDirectory(): Promise<string[]> {
    const contentsOfDirectory = await fs.readdir(this.absolutePathToDirectory);

    const listOfFilesInDirectory: string[] = [];

    for (let i = 0; i < contentsOfDirectory.length; i++) {
      const absoluteFilePathToTest = path.join(
        this.absolutePathToDirectory,
        contentsOfDirectory[i]
      );

      if (this.isFile(absoluteFilePathToTest))
        listOfFilesInDirectory.push(absoluteFilePathToTest);
    }

    return listOfFilesInDirectory;
  }

  /**
   * Checks if a path is pointing to file or not
   *
   * @private
   * @param {string} absoluteFilePath Absolute path to the file/directory
   * @return {Promise<boolean>} True is file. Otherwise, false.
   * @memberof File
   */
  private async isFile(absoluteFilePath: string): Promise<boolean> {
    return (await fs.stat(absoluteFilePath)).isFile();
  }

  /**
   * Reads JSON and HJSON files from the disk and parses it into JS Object
   *
   * @static
   * @param {string} pathToJson Absolute path to the JSON/HJSON file
   * @return {Promise<any>} Returns JS object parsed from JSON or HJSON file
   * @memberof File
   */
  public static async readJSONFile(pathToJson: string): Promise<any> {
    const jsonContent = await fs.readFile(pathToJson, { encoding: "utf8" });
    return hjson.parse(jsonContent);
  }
}
