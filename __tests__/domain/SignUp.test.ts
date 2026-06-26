import { SignUp } from "@/domain/use-cases/SignUp";
import { AuthRepository, Session } from "@/domain/repositories/AuthRepository";
import { User } from "@/domain/entities/User";

class InMemoryAuthRepository implements AuthRepository {
  private users: User[] = [];

  async signUp(email: string, password: string) {
    if (this.users.some((u) => u.email === email)) {
      throw new Error("User already exists");
    }

    const user = new User(crypto.randomUUID(), email);
    this.users.push(user);

    return {
      user,
      session: {
        accessToken: `token-${user.id}`,
        refreshToken: `refresh-${user.id}`,
      } satisfies Session,
    };
  }

  async signIn() {
    throw new Error("Not implemented");
  }

  async signOut() {
    return Promise.resolve();
  }

  async getCurrentUser() {
    return null;
  }
}

describe("SignUp use case", () => {
  let repository: InMemoryAuthRepository;
  let signUp: SignUp;

  beforeEach(() => {
    repository = new InMemoryAuthRepository();
    signUp = new SignUp(repository);
  });

  it("should create a user with valid email and password (happy path)", async () => {
    const result = await signUp.execute({
      email: "test@example.com",
      password: "123456",
    });

    expect(result.user.email).toBe("test@example.com");
    expect(result.session.accessToken).toBeDefined();
  });

  it("should trim the email", async () => {
    const result = await signUp.execute({
      email: "  test@example.com  ",
      password: "123456",
    });

    expect(result.user.email).toBe("test@example.com");
  });

  it("should throw when email is empty", async () => {
    await expect(
      signUp.execute({ email: "   ", password: "123456" })
    ).rejects.toThrow("Email is required");
  });

  it("should throw when email format is invalid", async () => {
    await expect(
      signUp.execute({ email: "invalid-email", password: "123456" })
    ).rejects.toThrow("Invalid email format");
  });

  it("should throw when password is too short", async () => {
    await expect(
      signUp.execute({ email: "test@example.com", password: "123" })
    ).rejects.toThrow("Password must be at least 6 characters");
  });
});
