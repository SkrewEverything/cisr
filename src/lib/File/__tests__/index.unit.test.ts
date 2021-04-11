import File from "../index";
import path from "path";

const mockFilesDir = path.resolve(__dirname, "mock-files");

describe("File module", () => {
  describe("Test all static methods", () => {
    it("should return JSON Object from given path to JSON with comments file", async () => {
      const pathToTestJSONFile = path.resolve(mockFilesDir, "test.json");
      const content = await File.readJSONFile(pathToTestJSONFile);

      expect(content).toMatchInlineSnapshot(`
        Object {
          "command": Object {
            "appendFlagName": false,
            "appendWith": " ",
            "args": Array [
              "args",
            ],
            "file": "echo",
            "message": "Text to display while running the command",
          },
          "message": "Text to display in the category list",
          "prompts": Array [
            Object {
              "choice": Array [],
              "initial": "Default value",
              "message": "Question to ask the user",
              "name": "flagName",
              "type": "input",
            },
          ],
        }
      `);
    });
  });

  describe("Test instance methods", () => {
    it("should return all files in a directory", async () => {
      const file = new File(mockFilesDir);
      const listOfFilesWithAbsolutePaths = await file.getAbsolutePathToAllFilesInTheDirectory();

      expect(listOfFilesWithAbsolutePaths.length).toBe(3);
    });
  });
});
