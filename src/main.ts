import { Editor, MarkdownView, Notice } from "obsidian";
import { SettingTab } from "./SettingTab";
import { commitToGithub } from "./commitToGithub";
import { Plugin } from "obsidian";

interface Settings {
  token: string;
}

const defaultSettings = {
  token: "",
};

export default class DailyShareCommitPlugin extends Plugin {
  public settings: Settings = defaultSettings;
  async onload() {
    this.settings = Object.assign({}, defaultSettings, await this.loadData());
    this.addSettingTab(new SettingTab(this.app, this));
    this.addCommand({
      id: "obsidian-plugin-daily-share-commit:command:commit",
      name: "Commit To Daily Share",
      editorCallback: async (editor: Editor, view: MarkdownView) => {
        console.log(view.data);
        console.log(this.settings);

        try {
          commitToGithub(
            view.data,
            this.settings.token,
            "cuixiaorui",
            "daily-share"
          );

          new Notice("提交成功");
          console.log("提交成功");
        } catch (error: any) {
          new Notice(`提交失败: ${error.message}}`);
          console.log("提交失败", error);
        }
      },
    });
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  onunload() {}
}
