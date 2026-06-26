import { NextRequest, NextResponse } from "next/server";
import { SignUp } from "@/domain/use-cases/SignUp";
import { SupabaseAuthRepository } from "@/infrastructure/repositories/SupabaseAuthRepository";
import { createSupabaseClient } from "@/infrastructure/database/supabaseClient";

let repository: SupabaseAuthRepository | null = null;

function getRepository(): SupabaseAuthRepository {
  if (!repository) {
    repository = new SupabaseAuthRepository(createSupabaseClient());
  }
  return repository;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (
      typeof body.email !== "string" ||
      typeof body.password !== "string"
    ) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const useCase = new SignUp(getRepository());
    const { user, session } = await useCase.execute({
      email: body.email,
      password: body.password,
    });

    return NextResponse.json(
      { user, session },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
