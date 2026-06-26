import { UpdateTask } from "@/domain/use-cases/UpdateTask";
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

describe("UpdateTask use case", () => {
  let repository: InMemoryTaskRepository;
  let updateTask: UpdateTask;

  beforeEach(() => {
    repository = new InMemoryTaskRepository();
    updateTask = new UpdateTask(repository);
  });

  it("should update title and description (happy path)", async () => {
    const task = TaskEntity.create({
      title: "Original",
      description: "Original description",
    });
    await repository.save(task);

    const result = await updateTask.execute({
      id: task.id,
      title: "Updated title",
      description: "Updated description",
    });

    expect(result.title).toBe("Updated title");
    expect(result.description).toBe("Updated description");
  });

  it("should trim the title when updating", async () => {
    const task = TaskEntity.create({ title: "Original" });
    await repository.save(task);

    const result = await updateTask.execute({
      id: task.id,
      title: "  Updated title  ",
    });

    expect(result.title).toBe("Updated title");
  });

  it("should throw when task is not found", async () => {
    await expect(
      updateTask.execute({ id: "non-existent-id", title: "Updated" })
    ).rejects.toThrow("Task not found");
  });

  it("should throw when updated title is empty", async () => {
    const task = TaskEntity.create({ title: "Original" });
    await repository.save(task);

    await expect(
      updateTask.execute({ id: task.id, title: "   " })
    ).rejects.toThrow("Task title cannot be empty");
  });
});
