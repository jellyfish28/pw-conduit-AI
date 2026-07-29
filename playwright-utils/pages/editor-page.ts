import { type Page, expect } from "@playwright/test";

type ArticleData = {
  title: string;
  description: string;
  body: string;
  tags: string[];
};

export class EditorPage {
  constructor(private page: Page) {}

  async publishArticle(article: ArticleData) {
    await this.page.getByPlaceholder("Article Title").fill(article.title);
    await this.page
      .getByPlaceholder("What's this article about?")
      .fill(article.description);
    await this.page
      .getByPlaceholder("Write your article (in markdown)")
      .fill(article.body);

    for (const tag of article.tags) {
      await this.page.getByPlaceholder("Enter tags").fill(tag);
      await this.page.getByPlaceholder("Enter tags").press("Enter");
    }

    await this.page.getByRole("button", { name: "Publish Article" }).click();
    await expect(this.page).toHaveURL(/\/article\//);
  }
}
