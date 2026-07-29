export function generateArticleData() {
  const uniqueSuffix = Date.now();

  return {
    title: `Test Article ${uniqueSuffix}`,
    description: `Test description ${uniqueSuffix}`,
    body: `Test body content for article ${uniqueSuffix}`,
    tags: ["automation", "playwright"],
  };
}
