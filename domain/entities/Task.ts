export interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: Date;
}

export class TaskEntity implements Task {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly completed: boolean,
    public readonly createdAt: Date
  ) {}

  static create(props: { title: string; description?: string | null }): TaskEntity {
    const trimmedTitle = props.title.trim();

    if (trimmedTitle.length === 0) {
      throw new Error("Task title cannot be empty");
    }

    if (trimmedTitle.length > 200) {
      throw new Error("Task title cannot exceed 200 characters");
    }

    return new TaskEntity(
      crypto.randomUUID(),
      trimmedTitle,
      props.description ?? null,
      false,
      new Date()
    );
  }

  markAsCompleted(): TaskEntity {
    return new TaskEntity(
      this.id,
      this.title,
      this.description,
      true,
      this.createdAt
    );
  }
}
