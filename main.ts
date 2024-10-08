import { App, Plugin, PluginSettingTab, Setting, Menu } from 'obsidian';
import { CanvasNodeData, CanvasTextData } from 'obsidian/canvas';

interface PomodoroCanvasSettings {
	sessionLength: number;
	shortBreakLength: number;
	longBreakLength: number;
}

const DEFAULT_SETTINGS: Partial<PomodoroCanvasSettings> = {
	sessionLength: 25,
	shortBreakLength: 25,
	longBreakLength: 25
}

enum SessionStatus {
	NotStarted,
	Started,
	Complete
}

enum TimerStatus {
	Off,
	On,
	Paused
}

interface PomodoroSession {
	sessionsAllocated: number;
	sessionsCompleted: number;
	sessionStatus: SessionStatus;
	timerStatus: TimerStatus;
}

export default class PomodoroCanvas extends Plugin {
	settings: PomodoroCanvasSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new PomodoroCanvasSettingTab(this.app, this));

		// Adding items to CanvasNode context menus
		this.registerEvent(this.app.workspace.on('canvas:node-menu', (menu: Menu, node: CanvasNodeData) => {
			if (node['pomodoroSession'] === undefined) {
				let newSession: PomodoroSession = {
					sessionsAllocated: 0,
					sessionsCompleted: 0,
					sessionStatus: SessionStatus.NotStarted,
					timerStatus: TimerStatus.Off
				}
				node['pomodoroSession'] = newSession;
			}

			menu.addItem((item) => {
				item.setTitle('+ Pomodoro session')
					.setIcon('star')
					.onClick(() => {
						node['pomodoroSession'].sessionsAllocated++;
						console.log(node['pomodoroSession'].sessionsAllocated);
					})
			})

			menu.addItem((item) => {
				item.setTitle('- Pomodoro session')
					.setIcon('star')
					.onClick(() => {
						if (node['pomodoroSession'].sessionsAllocated > node['pomodoroSession'].sessionsCompleted) {
							node['pomodoroSession'].sessionsAllocated--;
						}
						console.log(node['pomodoroSession'].sessionsAllocated);
					})
			})

			menu.addItem((item) => {
				item.setTitle('Mark complete')
					.setIcon('star')
					.onClick(() => {
						node['pomodoroSession'].sessionStatus = SessionStatus.Complete;
						node['pomodoroSession'].timerStatus = TimerStatus.Off;
					})
			})

			switch (node['pomodoroSession'].timerStatus) {
				case TimerStatus.Off:
					menu.addItem((item) => {
						item.setTitle('Start session')
							.setIcon('star')
							.onClick(() => {
								node['pomodoroSession'].timerStatus = TimerStatus.On;
							})
					})
					break;

				case TimerStatus.On:
					menu.addItem((item) => {
						item.setTitle('Pause session')
							.setIcon('star')
							.onClick(() => {
								node['pomodoroSession'].timerStatus = TimerStatus.Paused;
							})
					})

					menu.addItem((item) => {
						item.setTitle('Stop session')
							.setIcon('star')
							.onClick(() => {
								node['pomodoroSession'].timerStatus = TimerStatus.Off;
							})
					})
					break;

				case TimerStatus.Paused:
					menu.addItem((item) => {
						item.setTitle('Resume session')
							.setIcon('star')
							.onClick(() => {
								node['pomodoroSession'].timerStatus = TimerStatus.On;
							})
					})

					menu.addItem((item) => {
						item.setTitle('Stop session')
							.setIcon('star')
							.onClick(() => {
								node['pomodoroSession'].timerStatus = TimerStatus.Off;
							})
					})
					break;
			}
		}));
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class PomodoroCanvasSettingTab extends PluginSettingTab {
	plugin: PomodoroCanvas;

	constructor(app: App, plugin: PomodoroCanvas) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Session length')
			.setDesc('Length of a Pomodoro session')
			.addText((text) => {
				text.inputEl.setAttr('type', 'number');
				text.setPlaceholder('25');
				text.onChange(async (value) => {
					this.plugin.settings.sessionLength = Number(value);
					await this.plugin.saveSettings();
				})
			});

		new Setting(containerEl)
			.setName('Short break length')
			.setDesc('The duration of a short break')
			.addText((text) => {
				text.inputEl.setAttr('type', 'number');
				text.setPlaceholder('5');
				text.onChange(async (value) => {
					this.plugin.settings.shortBreakLength = Number(value)
					await this.plugin.saveSettings();
				})
			});

		new Setting(containerEl)
			.setName('Long break length')
			.setDesc('The duration of a long break')
			.addText((text) => {
				text.inputEl.setAttr('type', 'number');
				text.setPlaceholder('15');
				text.onChange(async (value) => {
					this.plugin.settings.longBreakLength = Number(value);
					await this.plugin.saveSettings();
				})
			});
	}
}
