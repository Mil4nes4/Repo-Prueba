import { NextRequest, NextResponse } from "next/server";
import { CreateTask } from "@/domain/use-cases/CreateTask";
import { SupabaseTaskRepository } from "@/infrastructure/repositories/SupabaseTaskRepository";
import { supabaseClient } from "@/infrastructure/database/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const repository = new SupabaseTaskRepository(supabaseClient);
    const useCase = new CreateTask(repository);

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
