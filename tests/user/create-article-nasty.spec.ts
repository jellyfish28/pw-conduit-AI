import { test, expect } from "../../playwright-utils/fixtures";
import { generateArticleData } from "../../playwright-utils/helpers/test-data";

test.describe("Article creation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("User can create an article with direct XPath locators", async ({
    page,
  }) => {
    const article = generateArticleData();
    const newArticleLink = page.getByRole("link", { name: "New Article" });
    const titleInput = page.getByRole("textbox", { name: "Article Title" });
    const descriptionInput = page.getByRole("textbox", {
      name: "What's this article about?",
    });
    const bodyInput = page.getByRole("textbox", {
      name: "Write your article (in markdown)",
    });
    const tagsInput = page.getByRole("textbox", { name: "Enter tags" });
    const publishButton = page.getByRole("button", {
      name: "Publish Article1/",
    });

    await newArticleLink.click();
    await titleInput.fill(article.title);
    await descriptionInput.fill(article.description);
    await bodyInput.fill(article.body);
    await tagsInput.fill(article.tags[0]);
    await tagsInput.press("Enter");
    await publishButton.click();

    await expect(
      page.getByRole("heading", { level: 1, name: article.title }),
    ).toBeVisible();
  });
});
