import { NextRequest, NextResponse } from "next/server";
import { SignOut } from "@/domain/use-cases/SignOut";
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
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Authorization token is required" },
        { status: 401 }
      );
    }

    const useCase = new SignOut(getRepository());
    await useCase.execute({ token });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
