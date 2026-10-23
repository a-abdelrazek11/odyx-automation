import { expect, test } from '../fixtures';
import { postLogin } from '../auth/login';
import { incorrectPassword, unregisteredEmail, validLogin } from '../data/login';
import { LoginPage } from '../pages/login.page';

test('Verify Login page displays all required fields', async ({ page }) => {
  const login = new LoginPage(page);
  await login.open();

  await expect(login.email).toBeVisible();
  await expect(login.password).toBeVisible();
  await expect(login.login).toBeVisible();
});

test('Verify successful login with valid registered credentials', async ({ page, request }) => {
  const response = await postLogin(request, validLogin);
  expect(response.ok()).toBeTruthy();

  const login = new LoginPage(page);
  await login.open();
  await login.signIn(validLogin.email, validLogin.password);
  await expect(page).not.toHaveURL(/login/i);
});

test('Verify login rejection for an unregistered or invalid email', async ({ page, request }) => {
  const response = await postLogin(request, {
    email: unregisteredEmail,
    password: validLogin.password,
  });
  expect(response.ok()).toBeFalsy();

  const login = new LoginPage(page);
  await login.open();
  await login.signIn(unregisteredEmail, validLogin.password);
  await expect(page.getByText(/error|invalid/i)).toBeVisible();
});

test('Verify login rejection for a valid registered email with an incorrect password', async ({ page, request }) => {
  const response = await postLogin(request, {
    email: validLogin.email,
    password: incorrectPassword,
  });
  expect(response.ok()).toBeFalsy();

  const login = new LoginPage(page);
  await login.open();
  await login.signIn(validLogin.email, incorrectPassword);
  await expect(page.getByText(/error|invalid|incorrect/i)).toBeVisible();
});

test('Verify empty email or password is blocked', async ({ page }) => {
  const login = new LoginPage(page);
  await login.open();
  await login.login.click();

  await expect
    .poll(() => login.email.evaluate((element) => (element as HTMLInputElement).validity.valueMissing))
    .toBe(true);
});

test('Verify authenticated session', async ({ request }) => {
  const response = await postLogin(request, validLogin);
  expect(response.ok()).toBeTruthy();

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  const token = payload.token ?? payload.accessToken ?? payload.access_token;
  const setCookie = response.headers()['set-cookie'] ?? '';
  expect(Boolean(token) || setCookie.length > 0).toBeTruthy();
});
