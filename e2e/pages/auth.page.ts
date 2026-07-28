import { Locator, Page } from "@playwright/test";

export class AuthPage {
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessages: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.getByPlaceholder("Username");
    this.emailInput = page.getByPlaceholder("Email");
    this.passwordInput = page.getByPlaceholder("Password");
    this.submitButton = page.getByRole("button", { name: /^Sign (in|up)$/ });
    this.errorMessages = page.locator(".error-messages li");
  }

  async gotoLogin(): Promise<void> {
    await this.page.goto("/login");
  }

  async gotoRegister(): Promise<void> {
    await this.page.goto("/register");
  }

  async fillLogin(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async fillRegister(
    username: string,
    email: string,
    password: string,
  ): Promise<void> {
    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
