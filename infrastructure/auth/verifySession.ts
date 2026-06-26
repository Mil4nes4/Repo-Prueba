import { NextRequest } from "next/server";
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

export async function verifySession(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return { user: null, error: "Authorization token is required" };
  }

  const useCase = new GetCurrentUser(getRepository());
  const user = await useCase.execute({ token });

  if (!user) {
    return { user: null, error: "Invalid or expired token" };
  }

  return { user, error: null };
}
