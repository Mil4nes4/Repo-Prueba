import { ToggleTaskCompletion } from "@/domain/use-cases/ToggleTaskCompletion";
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

describe("ToggleTaskCompletion use case", () => {
  let repository: InMemoryTaskRepository;
  let toggleCompletion: ToggleTaskCompletion;

  beforeEach(() => {
    repository = new InMemoryTaskRepository();
    toggleCompletion = new ToggleTaskCompletion(repository);
  });

  it("should mark a pending task as completed", async () => {
    const task = TaskEntity.create({ title: "Task to complete" });
    await repository.save(task);

    const result = await toggleCompletion.execute({ id: task.id });

    expect(result.completed).toBe(true);
  });

  it("should unmark a completed task as pending", async () => {
    const task = TaskEntity.create({ title: "Task to uncomplete" });
    await repository.save(task);
    await repository.update(task.markAsCompleted());

    const result = await toggleCompletion.execute({ id: task.id });

    expect(result.completed).toBe(false);
  });

  it("should throw when task is not found", async () => {
    await expect(
      toggleCompletion.execute({ id: "non-existent-id" })
    ).rejects.toThrow("Task not found");
  });
});
