import { AuthRepository } from "@/domain/repositories/AuthRepository";

export interface GetCurrentUserInput {
  token: string;
}

export class GetCurrentUser {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(input: GetCurrentUserInput) {
    return this.authRepository.getCurrentUser(input.token);
  }
}
