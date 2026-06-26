import { NextRequest, NextResponse } from "next/server";
import { CreateTask } from "@/domain/use-cases/CreateTask";
import { SupabaseTaskRepository } from "@/infrastructure/repositories/SupabaseTaskRepository";
import { createSupabaseServiceClient } from "@/infrastructure/database/supabaseServiceClient";
import { verifySession } from "@/infrastructure/auth/verifySession";

let repository: SupabaseTaskRepository | null = null;

function getRepository(): SupabaseTaskRepository {
  if (!repository) {
    repository = new SupabaseTaskRepository(createSupabaseServiceClient());
  }
  return repository;
}

export async function POST(request: NextRequest) {
  try {
    const { error: authError } = await verifySession(request);
    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const body = await request.json();

    if (typeof body.title !== "string") {
      return NextResponse.json(
        { error: "Title is required and must be a string" },
        { status: 400 }
      );
    }

    const useCase = new CreateTask(getRepository());

    const task = await useCase.execute({
      title: body.title,
      description: body.description,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { error: authError } = await verifySession(request);
    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const tasks = await getRepository().findAll();
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
