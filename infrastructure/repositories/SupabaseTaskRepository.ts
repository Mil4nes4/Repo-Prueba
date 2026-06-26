import { TaskEntity } from "@/domain/entities/Task";
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

  async save(task: TaskEntity): Promise<TaskEntity> {
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

  async update(task: TaskEntity): Promise<TaskEntity> {
    const row: Partial<TaskRow> = {
      title: task.title,
      description: task.description,
      completed: task.completed,
    };

    const { data, error } = await this.client
      .from("tasks")
      .update(row)
      .eq("id", task.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }

    return this.toDomain(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from("tasks").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }

  async findById(id: string): Promise<TaskEntity | null> {
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

  async findAll(): Promise<TaskEntity[]> {
    const { data, error } = await this.client
      .from("tasks")
      .select()
      .order("created_at", { ascending: false });

    if (error || !data) {
      throw new Error(`Failed to fetch tasks: ${error?.message}`);
    }

    return data.map((row) => this.toDomain(row));
  }

  private toDomain(row: TaskRow): TaskEntity {
    return new TaskEntity(
      row.id,
      row.title,
      row.description,
      row.completed,
      new Date(row.created_at)
    );
  }
}
