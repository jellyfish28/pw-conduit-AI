import { type Page, expect } from "@playwright/test";

export class HomePage {
  constructor(private page: Page) {}

  async openGlobalFeed() {
    await this.page.getByText("Global Feed").click();
    await expect(this.page.getByText("Global Feed")).toHaveClass(/active/);
  }

  async expectArticleVisibleInFeed(title: string) {
    await expect(this.page.getByRole("heading", { name: title })).toBeVisible();
  }

  async openArticleFromFeed(title: string) {
    await this.page.getByRole("heading", { name: title }).click();
    await expect(this.page).toHaveURL(/\/article\//);
  }

  async expectArticleNotVisibleInFeed(title: string) {
    await expect(
      this.page.getByRole("heading", { name: title }),
    ).not.toBeVisible();
  }

  async openFirstArticleFromFeed(): Promise<string> {
    const firstArticleHeading = this.page
      .getByRole("heading", { level: 1 })
      .first();
    await expect(firstArticleHeading).toBeVisible();
    const articleTitleValue = (await firstArticleHeading.textContent())!.trim();
    await firstArticleHeading.click();
    await expect(this.page).toHaveURL(/\/article\//);
    return articleTitleValue;
  }
}
