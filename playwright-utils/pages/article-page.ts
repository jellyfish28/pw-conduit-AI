import { type Page, expect } from "@playwright/test";

export class ArticlePage {
  constructor(private page: Page) {}

  async deleteArticle() {
    await this.page
      .getByRole("button", { name: "Delete Article" })
      .first()
      .click();
    await expect(this.page).toHaveURL("/");
  }

  async postComment(commentText: string) {
    await this.page
      .getByRole("textbox", { name: "Write a comment..." })
      .fill(commentText);
    await this.page.getByRole("button", { name: "Post Comment" }).click();
    await expect(
      this.page.getByRole("textbox", { name: "Write a comment..." }),
    ).toHaveValue("");
  }

  async expectCommentVisible(commentText: string) {
    await expect(
      this.page.getByTestId("comment-card").filter({ hasText: commentText }),
    ).toBeVisible();
  }

  async deleteComment(commentText: string) {
    await this.page
      .getByTestId("comment-card")
      .filter({ hasText: commentText })
      .locator(".ion-trash-a")
      .click();
    await expect(
      this.page.getByTestId("comment-card").filter({ hasText: commentText }),
    ).not.toBeVisible();
  }

  async expectCommentNotVisible(commentText: string) {
    await expect(
      this.page.getByTestId("comment-card").filter({ hasText: commentText }),
    ).not.toBeVisible();
  }
}
