import { AuthRepository } from "@/domain/repositories/AuthRepository";

export interface SignOutInput {
  token: string;
}

export class SignOut {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(input: SignOutInput) {
    return this.authRepository.signOut(input.token);
  }
}
