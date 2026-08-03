import fs from "fs";
import { test, expect } from "../../playwright-utils/fixtures";

const articleFile = "playwright-utils/.auth/article.json";

test.describe("Article deletion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("User can delete their article and it no longer appears in the Global Feed", async ({
    page,
    pom,
  }) => {
    const { title } = JSON.parse(fs.readFileSync(articleFile, "utf-8"));
    await pom.homePage.openGlobalFeed();
    await pom.homePage.openArticleFromFeed(title);
    await expect(
      page.getByRole("heading", { level: 1, name: title }),
    ).toBeVisible();
    await pom.articlePage.deleteArticle();
    await pom.homePage.openGlobalFeed();
    await pom.homePage.expectArticleNotVisibleInFeed(title);
  });
});
