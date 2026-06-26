import { TaskEntity } from "@/domain/entities/Task";

export interface TaskRepository {
  save(task: TaskEntity): Promise<TaskEntity>;
  update(task: TaskEntity): Promise<TaskEntity>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<TaskEntity | null>;
  findAll(): Promise<TaskEntity[]>;
}
