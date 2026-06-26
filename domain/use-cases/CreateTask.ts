import { TaskEntity } from "@/domain/entities/Task";
import { TaskRepository } from "@/domain/repositories/TaskRepository";

export interface CreateTaskInput {
  title: string;
  description?: string | null;
}

export class CreateTask {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: CreateTaskInput): Promise<TaskEntity> {
    const task = TaskEntity.create(input);
    return this.taskRepository.save(task);
  }
}
