import { APIRequestContext } from "@playwright/test";

const API_BASE_URL = "https://conduit-api.bondaracademy.com/api";

export interface TestUser {
  username: string;
  email: string;
  password: string;
}

export function generateTestUser(): TestUser {
  const unique = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return {
    username: `qa_${unique}`,
    email: `qa_${unique}@test.com`,
    password: "Password123",
  };
}

export async function registerUserViaApi(
  request: APIRequestContext,
  user: TestUser,
): Promise<void> {
  const response = await request.post(`${API_BASE_URL}/users`, {
    data: { user },
  });

  if (!response.ok()) {
    throw new Error(
      `Failed to create test user via API: ${response.status()} ${await response.text()}`,
    );
  }
}
