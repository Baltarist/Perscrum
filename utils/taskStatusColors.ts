import { TaskStatus } from "../types";

// This utility provides color classes for different task statuses.
// It's used to maintain a consistent color scheme across the app,
// for example, in the daily planner view.

export const getStatusColorClasses = (status: TaskStatus): { bg: string, text: string } => {
    switch (status) {
        case TaskStatus.Backlog:
            return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200' };
        case TaskStatus.Todo:
            return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-200' };
        case TaskStatus.InProgress:
            return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-200' };
        case TaskStatus.Review:
            return { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-200' };
        case TaskStatus.Done:
            return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-200' };
        default:
            return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200' };
    }
};
