import { test, expect } from "../../playwright-utils/fixtures";
import { generateArticleData } from "../../playwright-utils/helpers/test-data";

test.describe("Article creation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("User can create a new article and see it in the Global Feed", async ({
    page,
    pom,
  }) => {
    const article = generateArticleData();
    await pom.headerComponent.openNewArticle();
    await pom.editorPage.publishArticle(article);
    await expect(
      page.getByRole("heading", { level: 1, name: article.title }),
    ).toBeVisible();
    await pom.headerComponent.openHome();
    await pom.homePage.openGlobalFeed();
    await pom.homePage.expectArticleVisibleInFeed(article.title);
  });
});
