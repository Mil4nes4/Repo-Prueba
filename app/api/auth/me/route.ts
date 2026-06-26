import { NextRequest, NextResponse } from "next/server";
import { GetCurrentUser } from "@/domain/use-cases/GetCurrentUser";
import { SupabaseAuthRepository } from "@/infrastructure/repositories/SupabaseAuthRepository";
import { createSupabaseClient } from "@/infrastructure/database/supabaseClient";

let repository: SupabaseAuthRepository | null = null;

function getRepository(): SupabaseAuthRepository {
  if (!repository) {
    repository = new SupabaseAuthRepository(createSupabaseClient());
  }
  return repository;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const useCase = new GetCurrentUser(getRepository());
    const user = await useCase.execute({ token });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
