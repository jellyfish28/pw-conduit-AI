import { test, expect } from "@playwright/test";
import { AuthPage } from "../pages/auth.page";
import { HeaderComponent } from "../pages/header.component";
import { generateTestUser, registerUserViaApi } from "../utils/user-factory";

test.describe("User registration", () => {
  test("registers a new user and lands on the home page", async ({ page }) => {
    const authPage = new AuthPage(page);
    const header = new HeaderComponent(page);
    const user = generateTestUser();

    await authPage.gotoRegister();
    await authPage.fillRegister(user.username, user.email, user.password);
    await authPage.submit();

    await expect(page).toHaveURL("/");
    await expect(header.usernameLink(user.username)).toBeVisible();
    const token = await page.evaluate(() => localStorage.getItem("jwtToken"));
    expect(token).toBeTruthy();
  });

  test("shows an error when the email and username are already taken", async ({
    page,
    request,
  }) => {
    const authPage = new AuthPage(page);
    const user = generateTestUser();
    await registerUserViaApi(request, user);

    await authPage.gotoRegister();
    await authPage.fillRegister(user.username, user.email, user.password);
    await authPage.submit();

    await expect(page).toHaveURL("/register");
    await expect(authPage.errorMessages).toContainText([
      "email has already been taken",
      "username has already been taken",
    ]);
  });

  test("keeps the submit button disabled until all fields are filled", async ({
    page,
  }) => {
    const authPage = new AuthPage(page);

    await authPage.gotoRegister();
    await expect(authPage.submitButton).toBeDisabled();

    await authPage.usernameInput.fill("someuser");
    await authPage.emailInput.fill("someone@test.com");
    await expect(authPage.submitButton).toBeDisabled();

    await authPage.passwordInput.fill("Password123");
    await expect(authPage.submitButton).toBeEnabled();
  });
});

test.describe("User login", () => {
  test("logs in an existing user and lands on the home page", async ({
    page,
    request,
  }) => {
    const authPage = new AuthPage(page);
    const header = new HeaderComponent(page);
    const user = generateTestUser();
    await registerUserViaApi(request, user);

    await authPage.gotoLogin();
    await authPage.fillLogin(user.email, user.password);
    await authPage.submit();

    await expect(page).toHaveURL("/");
    await expect(header.usernameLink(user.username)).toBeVisible();
  });

  test("shows an error for a correct email with the wrong password", async ({
    page,
    request,
  }) => {
    const authPage = new AuthPage(page);
    const user = generateTestUser();
    await registerUserViaApi(request, user);

    await authPage.gotoLogin();
    await authPage.fillLogin(user.email, "not-the-right-password");
    await authPage.submit();

    await expect(page).toHaveURL("/login");
    await expect(authPage.errorMessages).toContainText([
      "email or password is invalid",
    ]);
    const token = await page.evaluate(() => localStorage.getItem("jwtToken"));
    expect(token).toBeNull();
  });

  test("shows an error for an email that is not registered", async ({
    page,
  }) => {
    const authPage = new AuthPage(page);
    const user = generateTestUser();

    await authPage.gotoLogin();
    await authPage.fillLogin(user.email, user.password);
    await authPage.submit();

    await expect(page).toHaveURL("/login");
    await expect(authPage.errorMessages).toContainText([
      "email or password is invalid",
    ]);
  });

  test("keeps the submit button disabled until all fields are filled", async ({
    page,
  }) => {
    const authPage = new AuthPage(page);

    await authPage.gotoLogin();
    await expect(authPage.submitButton).toBeDisabled();

    await authPage.emailInput.fill("someone@test.com");
    await expect(authPage.submitButton).toBeDisabled();

    await authPage.passwordInput.fill("Password123");
    await expect(authPage.submitButton).toBeEnabled();
  });
});
