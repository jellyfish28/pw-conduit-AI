import { test, expect } from "../../playwright-utils/fixtures";

test.describe("Article commenting", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("User can add a comment to the first article in the Global Feed and delete it", async ({
    page,
    pom,
  }) => {
    const commentText = `Test comment ${Date.now()}`;
    await pom.homePage.openGlobalFeed();
    const articleTitle = await pom.homePage.openFirstArticleFromFeed();
    await expect(
      page.getByRole("heading", { level: 1, name: articleTitle }),
    ).toBeVisible();
    await pom.articlePage.postComment(commentText);
    await pom.articlePage.expectCommentVisible(commentText);
    await pom.articlePage.deleteComment(commentText);
    await pom.articlePage.expectCommentNotVisible(commentText);
  });
});
