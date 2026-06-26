import { TaskEntity } from "@/domain/entities/Task";

type Row = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
};

function toRow(task: TaskEntity): Row {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    completed: task.completed,
    created_at: task.createdAt.toISOString(),
  };
}

function toTask(row: Row): TaskEntity {
  return new TaskEntity(
    row.id,
    row.title,
    row.description,
    row.completed,
    new Date(row.created_at)
  );
}

export function createMockSupabaseClient(initialTasks: TaskEntity[] = []) {
  const rows = new Map(initialTasks.map((t) => [t.id, toRow(t)]));
  let lastFilter: { column: string; value: unknown } | null = null;
  let lastOrder: { column: string; ascending: boolean } | null = null;

  const chain = {
    from: jest.fn(() => chain),

    insert: jest.fn((row: Row) => {
      rows.set(row.id, row);
      chain.single.mockResolvedValueOnce({ data: row, error: null });
      return chain;
    }),

    update: jest.fn((row: Partial<Row>) => {
      chain.single.mockImplementationOnce(async () => {
        if (!lastFilter || lastFilter.column !== "id") {
          return { data: null, error: { message: "Missing filter" } };
        }
        const existing = rows.get(lastFilter.value as string);
        if (!existing) {
          return { data: null, error: { message: "Not found" } };
        }
        const updated = { ...existing, ...row };
        rows.set(updated.id, updated);
        return { data: updated, error: null };
      });
      return chain;
    }),

    delete: jest.fn(() => {
      chain.single.mockImplementationOnce(async () => {
        if (!lastFilter || lastFilter.column !== "id") {
          return { data: null, error: { message: "Missing filter" } };
        }
        const existed = rows.delete(lastFilter.value as string);
        return { data: existed ? {} : null, error: existed ? null : { message: "Not found" } };
      });
      return chain;
    }),

    select: jest.fn(() => {
      chain.order.mockImplementationOnce(async () => {
        let result = Array.from(rows.values());

        if (lastFilter) {
          result = result.filter((r) => {
            const value = (r as Record<string, unknown>)[lastFilter!.column];
            return value === lastFilter!.value;
          });
        }

        if (lastOrder) {
          result = result.sort((a, b) => {
            const aValue = (a as Record<string, unknown>)[lastOrder!.column];
            const bValue = (b as Record<string, unknown>)[lastOrder!.column];
            if (typeof aValue === "string" && typeof bValue === "string") {
              return lastOrder!.ascending
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
            }
            return 0;
          });
        }

        return { data: result, error: null };
      });
      return chain;
    }),

    eq: jest.fn((column: string, value: unknown) => {
      lastFilter = { column, value };
      return chain;
    }),

    order: jest.fn((column: string, { ascending }: { ascending: boolean }) => {
      lastOrder = { column, ascending };
      return Promise.resolve({ data: Array.from(rows.values()), error: null });
    }),

    single: jest.fn(() => Promise.resolve({ data: null, error: null })),
  };

  // Comportamiento por defecto: devolver arrays vacíos
  chain.order.mockResolvedValue({ data: [], error: null });

  return {
    ...chain,
    getRows: () => Array.from(rows.values()).map(toTask),
  } as unknown as {
    from: jest.Mock;
    insert: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    select: jest.Mock;
    eq: jest.Mock;
    order: jest.Mock;
    single: jest.Mock;
    getRows: () => Task[];
  };
}
