import { App, PluginSettingTab, Setting } from "obsidian";
import DailyShareCommitPlugin from "./main";

export class SettingTab extends PluginSettingTab {
  private plugin: DailyShareCommitPlugin;
  constructor(app: App, plugin: DailyShareCommitPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl, plugin } = this;

    containerEl.empty();
    containerEl.createEl("h2", { text: "Submit Content To Github Issue" });

    function addGitTokenView() {
      new Setting(containerEl)
        .setName("Git Token")
        .setDesc("GH_TOKEN")
        .addText((text) =>
          text
            .setPlaceholder("Enter your git token")
            .setValue(plugin.settings.token)
            .onChange(async (value) => {
              console.log("git token: " + value);
              plugin.settings.token = value;
              await plugin.saveSettings();
            })
        );
    }

    addGitTokenView();
  }
}
