import { Locator, Page } from "@playwright/test";

export class HeaderComponent {
  readonly signInLink: Locator;
  readonly signUpLink: Locator;

  constructor(private readonly page: Page) {
    this.signInLink = page.getByRole("link", { name: "Sign in" });
    this.signUpLink = page.getByRole("link", { name: "Sign up" });
  }

  usernameLink(username: string): Locator {
    return this.page.getByRole("link", { name: username });
  }
}
