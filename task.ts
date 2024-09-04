export enum TaskStatus {
	Incomplete,
	Complete
}

export enum TimerStatus {
	Off,
	On,
	Paused
}

export interface Task {
	sessionsAllocated: number;
	sessionsCompleted: number;
	taskStatus: TaskStatus;
	timerStatus: TimerStatus
}

