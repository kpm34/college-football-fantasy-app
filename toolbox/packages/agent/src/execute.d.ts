import type { Task } from "./schema";
export declare function execute(task: Task): Promise<{
    goal: string;
    outputs: any[];
}>;
