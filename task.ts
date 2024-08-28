enum TaskStatus {
	Incomplete,
	Complete
}

enum TimerStatus {
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

