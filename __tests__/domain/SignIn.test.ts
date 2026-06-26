import { SignIn } from "@/domain/use-cases/SignIn";
import { AuthRepository, Session } from "@/domain/repositories/AuthRepository";
import { User } from "@/domain/entities/User";

class InMemoryAuthRepository implements AuthRepository {
  constructor(private readonly validEmail: string, private readonly validPassword: string) {}

  async signUp() {
    throw new Error("Not implemented");
  }

  async signIn(email: string, password: string) {
    if (email !== this.validEmail || password !== this.validPassword) {
      throw new Error("Invalid credentials");
    }

    const user = new User(crypto.randomUUID(), email);
    return {
      user,
      session: {
        accessToken: `token-${user.id}`,
        refreshToken: `refresh-${user.id}`,
      } satisfies Session,
    };
  }

  async signOut() {
    return Promise.resolve();
  }

  async getCurrentUser() {
    return null;
  }
}

describe("SignIn use case", () => {
  let repository: InMemoryAuthRepository;
  let signIn: SignIn;

  beforeEach(() => {
    repository = new InMemoryAuthRepository("user@example.com", "password123");
    signIn = new SignIn(repository);
  });

  it("should sign in with valid credentials (happy path)", async () => {
    const result = await signIn.execute({
      email: "user@example.com",
      password: "password123",
    });

    expect(result.user.email).toBe("user@example.com");
    expect(result.session.accessToken).toBeDefined();
  });

  it("should trim the email", async () => {
    const result = await signIn.execute({
      email: "  user@example.com  ",
      password: "password123",
    });

    expect(result.user.email).toBe("user@example.com");
  });

  it("should throw when email is empty", async () => {
    await expect(
      signIn.execute({ email: "   ", password: "password123" })
    ).rejects.toThrow("Email is required");
  });

  it("should throw when password is empty", async () => {
    await expect(
      signIn.execute({ email: "user@example.com", password: "" })
    ).rejects.toThrow("Password is required");
  });
});
