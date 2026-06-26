import { AuthRepository } from "@/domain/repositories/AuthRepository";

export interface SignInInput {
  email: string;
  password: string;
}

export class SignIn {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(input: SignInInput) {
    const trimmedEmail = input.email.trim();

    if (trimmedEmail.length === 0) {
      throw new Error("Email is required");
    }

    if (input.password.length === 0) {
      throw new Error("Password is required");
    }

    return this.authRepository.signIn(trimmedEmail, input.password);
  }
}
