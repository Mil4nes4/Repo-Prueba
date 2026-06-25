import { Task } from "@/domain/entities/Task";

type Filter = { column: string; value: unknown };
type Order = { column: string; ascending: boolean };

export function createMockSupabaseClient(initialTasks: Task[] = []) {
  const tasks = new Map(initialTasks.map((t) => [t.id, t]));

  const mockClient = {
    from: jest.fn(() => mockClient),
    insert: jest.fn(() => mockClient),
    select: jest.fn(() => mockClient),
    single: jest.fn(() => mockClient),
    eq: jest.fn(() => mockClient),
    order: jest.fn(() => mockClient),

    // Resoluciones dinámicas
    async resolveInsert(row: Task) {
      tasks.set(row.id, row);
      return { data: row, error: null };
    },

    async resolveSelect(filter?: Filter, order?: Order) {
      let result = Array.from(tasks.values());

      if (filter) {
        result = result.filter((t) => {
          const value = (t as Record<string, unknown>)[filter.column];
          return value === filter.value;
        });
      }

      if (order) {
        result = result.sort((a, b) => {
          const aValue = (a as Record<string, unknown>)[order.column];
          const bValue = (b as Record<string, unknown>)[order.column];
          if (aValue instanceof Date && bValue instanceof Date) {
            return order.ascending
              ? aValue.getTime() - bValue.getTime()
              : bValue.getTime() - aValue.getTime();
          }
          return 0;
        });
      }

      return { data: result, error: null };
    },

    async resolveSingle(id: string) {
      const task = tasks.get(id);
      return { data: task ?? null, error: task ? null : { message: "Not found" } };
    },
  };

  // Comportamiento por defecto: devolver arrays vacíos
  mockClient.select.mockResolvedValue({ data: [], error: null });

  return mockClient;
}
