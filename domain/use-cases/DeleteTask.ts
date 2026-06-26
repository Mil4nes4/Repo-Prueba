import { TaskRepository } from "@/domain/repositories/TaskRepository";

export interface DeleteTaskInput {
  id: string;
}

export class DeleteTask {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: DeleteTaskInput): Promise<void> {
    const existingTask = await this.taskRepository.findById(input.id);

    if (!existingTask) {
      throw new Error("Task not found");
    }

    return this.taskRepository.delete(input.id);
  }
}
