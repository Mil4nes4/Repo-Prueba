import { TaskRepository } from "@/domain/repositories/TaskRepository";

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string | null;
}

export class UpdateTask {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: UpdateTaskInput) {
    const existingTask = await this.taskRepository.findById(input.id);

    if (!existingTask) {
      throw new Error("Task not found");
    }

    const updatedTask = existingTask.update({
      title: input.title,
      description: input.description,
    });

    return this.taskRepository.update(updatedTask);
  }
}
