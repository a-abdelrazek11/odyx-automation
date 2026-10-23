import { type APIRequestContext, type APIResponse } from '@playwright/test';

export function postLogin(
  request: APIRequestContext,
  body: { email: string; password: string },
): Promise<APIResponse> {
  return request.post('/auth/login', { data: body });
}
