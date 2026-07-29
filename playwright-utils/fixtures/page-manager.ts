import type { Page } from "@playwright/test";
import { HeaderComponent } from "../pages/header-component";
import { HomePage } from "../pages/home-page";
import { EditorPage } from "../pages/editor-page";

export class PageManager {
  readonly headerComponent: HeaderComponent;
  readonly homePage: HomePage;
  readonly editorPage: EditorPage;

  constructor(page: Page) {
    this.headerComponent = new HeaderComponent(page);
    this.homePage = new HomePage(page);
    this.editorPage = new EditorPage(page);
  }
}
