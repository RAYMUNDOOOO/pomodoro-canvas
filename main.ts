import { App, Plugin, PluginSettingTab, Setting, Menu } from 'obsidian';
import { CanvasNodeData } from 'obsidian/canvas';
import { Task, TaskStatus, TimerStatus } from 'task';

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

export default class PomodoroCanvas extends Plugin {
	settings: PomodoroCanvasSettings;
	currentCanvas: Map<string, Task> = new Map<string, Task>();

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new PomodoroCanvasSettingTab(this.app, this));

		/* 
		 * Adding buttons to the context menu to allocate, de-allocate, start, pause, resume and stop
		 * pomodoro sessions on a given node.
		 */
		this.registerEvent(this.app.workspace.on('canvas:node-menu', (menu: Menu, node: CanvasNodeData) => {
			// Adding button to allocate sessions to task if current node is not in Map
			if (!this.currentCanvas.has(node.id)) {
				this.addContextMenuButton(menu, '+', 'star', () => {
					let t: Task = {
						sessionsAllocated: 1,
						sessionsCompleted: 0,
						taskStatus: TaskStatus.Incomplete,
						timerStatus: TimerStatus.Off
					};

					this.currentCanvas.set(node.id, t);
				})
			} else {
				// Add buttons to allocate & de-allocate sessions, and start timer if node is in Map
				let t: Task = this.currentCanvas.get(node.id);
				this.addContextMenuButton(menu, '+', 'star', () => {
					t.sessionsAllocated++;
				});

				this.addContextMenuButton(menu, '-', 'star', () => {
					if (t.sessionsAllocated > 0) {
						t.sessionsAllocated--;
					}
				});

				this.addContextMenuButton(menu, 'Start timer', 'star', () => {
					t.timerStatus = TimerStatus.On;
				});
			}

			// DEBUGGING
			this.addContextMenuButton(menu, 'DEBUG', 'star', () => {
				if (this.currentCanvas.has(node.id)) {
					console.log(this.currentCanvas.get(node.id));
				}
			})
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

	addContextMenuButton(menu: Menu, title: string, icon: string, callback: any) {
		menu.addItem((item) => {
			item.setTitle(title)
				.setIcon(icon)
				.onClick(callback)
		})
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
