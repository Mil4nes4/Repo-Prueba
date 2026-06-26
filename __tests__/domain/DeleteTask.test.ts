import { DeleteTask } from "@/domain/use-cases/DeleteTask";
import { TaskRepository } from "@/domain/repositories/TaskRepository";
import { TaskEntity } from "@/domain/entities/Task";

class InMemoryTaskRepository implements TaskRepository {
  private tasks: TaskEntity[] = [];

  async save(task: TaskEntity): Promise<TaskEntity> {
    this.tasks.push(task);
    return task;
  }

  async update(task: TaskEntity): Promise<TaskEntity> {
    const index = this.tasks.findIndex((t) => t.id === task.id);
    if (index === -1) {
      throw new Error("Task not found");
    }
    this.tasks[index] = task;
    return task;
  }

  async delete(id: string): Promise<void> {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.tasks.splice(index, 1);
    }
  }

  async findById(id: string): Promise<TaskEntity | null> {
    return this.tasks.find((t) => t.id === id) ?? null;
  }

  async findAll(): Promise<TaskEntity[]> {
    return this.tasks;
  }
}

describe("DeleteTask use case", () => {
  let repository: InMemoryTaskRepository;
  let deleteTask: DeleteTask;

  beforeEach(() => {
    repository = new InMemoryTaskRepository();
    deleteTask = new DeleteTask(repository);
  });

  it("should delete an existing task", async () => {
    const task = TaskEntity.create({ title: "Task to delete" });
    await repository.save(task);

    await deleteTask.execute({ id: task.id });

    const remaining = await repository.findById(task.id);
    expect(remaining).toBeNull();
  });

  it("should throw when task is not found", async () => {
    await expect(
      deleteTask.execute({ id: "non-existent-id" })
    ).rejects.toThrow("Task not found");
  });
});
