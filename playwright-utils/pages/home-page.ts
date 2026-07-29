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
}
