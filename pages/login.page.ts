import { type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly email: Locator;
  readonly password: Locator;
  readonly login: Locator;

  constructor(private readonly page: Page) {
    this.email = page.getByLabel(/email address/i);
    this.password = page.getByLabel(/^password$/i);
    this.login = page.getByRole('button', { name: /^login$/i });
  }

  async open(): Promise<void> {
    await this.page.goto('/');
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.login.click();
  }
}
