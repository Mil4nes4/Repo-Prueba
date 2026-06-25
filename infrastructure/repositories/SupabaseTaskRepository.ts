import { Task } from "@/domain/entities/Task";
import { TaskRepository } from "@/domain/repositories/TaskRepository";
import { SupabaseClient } from "@supabase/supabase-js";

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
}

export class SupabaseTaskRepository implements TaskRepository {
  constructor(private readonly client: SupabaseClient) {}

  async save(task: Task): Promise<Task> {
    const row: TaskRow = {
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      created_at: task.createdAt.toISOString(),
    };

    const { data, error } = await this.client
      .from("tasks")
      .insert(row)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save task: ${error.message}`);
    }

    return this.toDomain(data);
  }

  async findById(id: string): Promise<Task | null> {
    const { data, error } = await this.client
      .from("tasks")
      .select()
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findAll(): Promise<Task[]> {
    const { data, error } = await this.client
      .from("tasks")
      .select()
      .order("created_at", { ascending: false });

    if (error || !data) {
      throw new Error(`Failed to fetch tasks: ${error?.message}`);
    }

    return data.map(this.toDomain);
  }

  private toDomain(row: TaskRow): Task {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      completed: row.completed,
      createdAt: new Date(row.created_at),
    };
  }
}
