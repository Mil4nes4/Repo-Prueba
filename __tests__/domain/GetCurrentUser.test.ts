import { GetCurrentUser } from "@/domain/use-cases/GetCurrentUser";
import { AuthRepository } from "@/domain/repositories/AuthRepository";
import { User } from "@/domain/entities/User";

class InMemoryAuthRepository implements AuthRepository {
  constructor(private readonly currentUser: User | null) {}

  async signUp() {
    throw new Error("Not implemented");
  }

  async signIn() {
    throw new Error("Not implemented");
  }

  async signOut() {
    return Promise.resolve();
  }

  async getCurrentUser() {
    return this.currentUser;
  }
}

describe("GetCurrentUser use case", () => {
  it("should return the current user when token is valid", async () => {
    const user = new User("user-1", "user@example.com");
    const repository = new InMemoryAuthRepository(user);
    const useCase = new GetCurrentUser(repository);

    const result = await useCase.execute({ token: "valid-token" });

    expect(result).not.toBeNull();
    expect(result?.email).toBe("user@example.com");
  });

  it("should return null when token is invalid", async () => {
    const repository = new InMemoryAuthRepository(null);
    const useCase = new GetCurrentUser(repository);

    const result = await useCase.execute({ token: "invalid-token" });

    expect(result).toBeNull();
  });
});
