import { TaskRepository } from "@/domain/repositories/TaskRepository";

export interface ToggleTaskCompletionInput {
  id: string;
}

export class ToggleTaskCompletion {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: ToggleTaskCompletionInput) {
    const existingTask = await this.taskRepository.findById(input.id);

    if (!existingTask) {
      throw new Error("Task not found");
    }

    const toggledTask = existingTask.toggleCompletion();

    return this.taskRepository.update(toggledTask);
  }
}
