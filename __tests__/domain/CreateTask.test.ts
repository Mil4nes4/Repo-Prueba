import { CreateTask } from "@/domain/use-cases/CreateTask";
import { TaskRepository } from "@/domain/repositories/TaskRepository";
import { Task } from "@/domain/entities/Task";

class InMemoryTaskRepository implements TaskRepository {
  private tasks: Task[] = [];

  async save(task: Task): Promise<Task> {
    this.tasks.push(task);
    return task;
  }

  async findById(): Promise<Task | null> {
    return null;
  }

  async findAll(): Promise<Task[]> {
    return this.tasks;
  }
}

describe("CreateTask use case", () => {
  let repository: InMemoryTaskRepository;
  let createTask: CreateTask;

  beforeEach(() => {
    repository = new InMemoryTaskRepository();
    createTask = new CreateTask(repository);
  });

  it("should create a task with a trimmed title (happy path)", async () => {
    const result = await createTask.execute({
      title: "  Learn Clean Architecture  ",
      description: "Practice before the hackathon",
    });

    expect(result.title).toBe("Learn Clean Architecture");
    expect(result.description).toBe("Practice before the hackathon");
    expect(result.completed).toBe(false);
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it("should throw when the title is empty", async () => {
    await expect(createTask.execute({ title: "   " })).rejects.toThrow(
      "Task title cannot be empty"
    );
  });

  it("should throw when the title exceeds 200 characters", async () => {
    const longTitle = "a".repeat(201);
    await expect(createTask.execute({ title: longTitle })).rejects.toThrow(
      "Task title cannot exceed 200 characters"
    );
  });
});
