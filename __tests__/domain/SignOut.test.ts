import { SignOut } from "@/domain/use-cases/SignOut";
import { AuthRepository } from "@/domain/repositories/AuthRepository";

class InMemoryAuthRepository implements AuthRepository {
  signedOutTokens: string[] = [];

  async signUp() {
    throw new Error("Not implemented");
  }

  async signIn() {
    throw new Error("Not implemented");
  }

  async signOut(token: string) {
    this.signedOutTokens.push(token);
    return Promise.resolve();
  }

  async getCurrentUser() {
    return null;
  }
}

describe("SignOut use case", () => {
  let repository: InMemoryAuthRepository;
  let signOut: SignOut;

  beforeEach(() => {
    repository = new InMemoryAuthRepository();
    signOut = new SignOut(repository);
  });

  it("should sign out with a valid token", async () => {
    await signOut.execute({ token: "valid-token" });
    expect(repository.signedOutTokens).toContain("valid-token");
  });
});
