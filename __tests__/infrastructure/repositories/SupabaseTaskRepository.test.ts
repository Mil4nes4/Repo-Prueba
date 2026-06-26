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
  let filterId: string | null = null;

  const chain = {
    from: jest.fn(() => chain),

    insert: jest.fn((row: Row) => {
      rows.set(row.id, row);
      chain.single.mockResolvedValueOnce({ data: row, error: null });
      return chain;
    }),

    update: jest.fn((row: Partial<Row>) => {
      chain.single.mockImplementationOnce(async () => {
        if (!filterId) {
          return { data: null, error: { message: "Missing filter" } };
        }
        const existing = rows.get(filterId);
        if (!existing) {
          return { data: null, error: { message: "Not found" } };
        }
        const updated = { ...existing, ...row };
        rows.set(updated.id, updated);
        filterId = null;
        return { data: updated, error: null };
      });
      return chain;
    }),

    delete: jest.fn(() => {
      chain.single.mockImplementationOnce(async () => {
        if (!filterId) {
          return { data: null, error: { message: "Missing filter" } };
        }
        const existed = rows.delete(filterId);
        filterId = null;
        return { data: existed ? {} : null, error: existed ? null : { message: "Not found" } };
      });
      return chain;
    }),

    select: jest.fn(() => {
      chain.order.mockImplementationOnce(async () => {
        const sorted = Array.from(rows.values()).sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        return { data: sorted, error: null };
      });
      return chain;
    }),

    eq: jest.fn((_column: string, value: string) => {
      filterId = value;
      return chain;
    }),

    order: jest.fn(() =>
      Promise.resolve({ data: Array.from(rows.values()), error: null })
    ),

    single: jest.fn(() => Promise.resolve({ data: null, error: null })),
  };

  return chain as unknown as {
    from: jest.Mock;
    insert: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
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

  it("should update a task and return it as domain entity", async () => {
    const task = TaskEntity.create({ title: "Original title" });
    const client = createMockClient([toRow(task)]);
    const repository = new SupabaseTaskRepository(client as never);

    const updated = task.update({ title: "Updated title" });
    const result = await repository.update(updated);

    expect(client.from).toHaveBeenCalledWith("tasks");
    expect(client.eq).toHaveBeenCalledWith("id", task.id);
    expect(result.title).toBe("Updated title");
  });

  it("should delete a task by id", async () => {
    const task = TaskEntity.create({ title: "To delete" });
    const client = createMockClient([toRow(task)]);
    const repository = new SupabaseTaskRepository(client as never);

    await repository.delete(task.id);

    expect(client.from).toHaveBeenCalledWith("tasks");
    expect(client.eq).toHaveBeenCalledWith("id", task.id);
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
