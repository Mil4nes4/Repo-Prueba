import { AuthRepository } from "@/domain/repositories/AuthRepository";

export interface SignUpInput {
  email: string;
  password: string;
}

export class SignUp {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(input: SignUpInput) {
    const trimmedEmail = input.email.trim();

    if (trimmedEmail.length === 0) {
      throw new Error("Email is required");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      throw new Error("Invalid email format");
    }

    if (input.password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    return this.authRepository.signUp(trimmedEmail, input.password);
  }
}
