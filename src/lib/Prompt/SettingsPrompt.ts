import { CISRPrompt } from "./CISRPrompt";
import { Input } from "enquirer";
import store from "data-store";
import path from "path";

// Default store name
const storeName: string =
  process.env.NODE_ENV === "development" ? "cisr-dev" : "cisr";
const storeObj = store(storeName);

export class SettingsPrompt extends CISRPrompt {
  constructor() {
    const settingsPrompt = [
      new Input({
        name: "dir",
        message: "Absolute path to scripts folder",
        initial: storeObj.get("dir") ?? "",
      }),
      new Input({
        name: "message",
        message: "Welcome Banner text",
        initial: storeObj.get("message") ?? "",
      }),
    ];

    super("Settings", settingsPrompt);
  }

  public async runCommand() {
    this.saveSettingsToStore();
  }

  private saveSettingsToStore() {
    storeObj.set("dir", path.resolve(this.answers.dir));
    storeObj.set("message", this.answers.message);
    storeObj.save();
  }
}
