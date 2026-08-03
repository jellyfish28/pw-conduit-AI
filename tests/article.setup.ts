import { test as setup } from "@playwright/test";
import fs from "fs";
import { generateArticleData } from "../playwright-utils/helpers/test-data";

const userFile = "playwright-utils/.auth/user.json";
const articleFile = "playwright-utils/.auth/article.json";
const apiBaseUrl = "https://conduit-api.bondaracademy.com/api";

setup("create article via API", async ({ request }) => {
  const storageState = JSON.parse(fs.readFileSync(userFile, "utf-8"));
  const jwtToken = storageState.origins[0].localStorage.find(
    (item: { name: string }) => item.name === "jwtToken",
  ).value;
  const article = generateArticleData();
  const response = await request.post(`${apiBaseUrl}/articles/`, {
    headers: { Authorization: `Token ${jwtToken}` },
    data: {
      article: {
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: article.tags,
      },
    },
  });
  const responseBody = await response.json();
  fs.writeFileSync(
    articleFile,
    JSON.stringify({
      title: responseBody.article.title,
      slug: responseBody.article.slug,
    }),
  );
});
