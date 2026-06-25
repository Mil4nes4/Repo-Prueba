import { SupabaseTaskRepository } from "@/infrastructure/repositories/SupabaseTaskRepository";
import { TaskEntity } from "@/domain/entities/Task";

type Row = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
};

function toRow(task: ReturnType<typeof TaskEntity.create>): Row {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    completed: task.completed,
    created_at: task.createdAt.toISOString(),
  };
}

function createMockClient(initialTasks: Row[] = []) {
  const rows = new Map(initialTasks.map((row) => [row.id, row]));

  const chain = {
    from: jest.fn(() => chain),
    insert: jest.fn((row: Row) => {
      rows.set(row.id, row);
      chain.single.mockResolvedValueOnce({ data: row, error: null });
      return chain;
    }),
    select: jest.fn(() => {
      const sorted = Array.from(rows.values()).sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      chain.order.mockResolvedValueOnce({ data: sorted, error: null });
      return chain;
    }),
    eq: jest.fn(() => chain),
    order: jest.fn(() =>
      Promise.resolve({ data: Array.from(rows.values()), error: null })
    ),
    single: jest.fn(() => Promise.resolve({ data: null, error: null })),
  };

  return chain as unknown as {
    from: jest.Mock;
    insert: jest.Mock;
    select: jest.Mock;
    eq: jest.Mock;
    order: jest.Mock;
    single: jest.Mock;
  };
}

describe("SupabaseTaskRepository", () => {
  it("should save a task and return it as domain entity", async () => {
    const client = createMockClient();
    const repository = new SupabaseTaskRepository(client as never);
    const task = TaskEntity.create({ title: "Test task" });

    const result = await repository.save(task);

    expect(client.from).toHaveBeenCalledWith("tasks");
    expect(client.insert).toHaveBeenCalledWith(toRow(task));
    expect(result.id).toBe(task.id);
    expect(result.title).toBe("Test task");
    expect(result.completed).toBe(false);
  });

  it("should return all tasks ordered by created_at descending", async () => {
    const taskA = TaskEntity.create({ title: "Task A" });
    const taskB = TaskEntity.create({ title: "Task B" });
    const client = createMockClient([toRow(taskA), toRow(taskB)]);
    const repository = new SupabaseTaskRepository(client as never);

    const result = await repository.findAll();

    expect(client.from).toHaveBeenCalledWith("tasks");
    expect(client.order).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
    expect(result).toHaveLength(2);
  });
});
