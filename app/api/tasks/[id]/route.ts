import { NextRequest, NextResponse } from "next/server";
import { UpdateTask } from "@/domain/use-cases/UpdateTask";
import { ToggleTaskCompletion } from "@/domain/use-cases/ToggleTaskCompletion";
import { DeleteTask } from "@/domain/use-cases/DeleteTask";
import { SupabaseTaskRepository } from "@/infrastructure/repositories/SupabaseTaskRepository";
import { createSupabaseServiceClient } from "@/infrastructure/database/supabaseServiceClient";

let repository: SupabaseTaskRepository | null = null;

function getRepository(): SupabaseTaskRepository {
  if (!repository) {
    repository = new SupabaseTaskRepository(createSupabaseServiceClient());
  }
  return repository;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.title !== undefined && typeof body.title !== "string") {
      return NextResponse.json(
        { error: "Title must be a string" },
        { status: 400 }
      );
    }

    if (
      body.description !== undefined &&
      body.description !== null &&
      typeof body.description !== "string"
    ) {
      return NextResponse.json(
        { error: "Description must be a string or null" },
        { status: 400 }
      );
    }

    const useCase = new UpdateTask(getRepository());
    const task = await useCase.execute({
      id,
      title: body.title,
      description: body.description,
    });

    return NextResponse.json(task, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Task not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const useCase = new ToggleTaskCompletion(getRepository());
    const task = await useCase.execute({ id });

    return NextResponse.json(task, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Task not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const useCase = new DeleteTask(getRepository());
    await useCase.execute({ id });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Task not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
