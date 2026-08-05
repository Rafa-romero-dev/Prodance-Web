import { test, expect } from '@playwright/test'

const ADMIN = { email: 'admin@prodance.com', password: 'admin123' }
const STUDENT = { email: 'alice@example.com', password: 'alice123' }

async function submitLoginForm(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
}

async function login(page: import('@playwright/test').Page, email: string, password: string) {
  await submitLoginForm(page, email, password)
  // signIn() is async (redirect: false) and only navigates after the
  // session cookie is set — wait for that before the caller does anything
  // else, or a subsequent page.goto() can race ahead of the cookie.
  await expect(page).toHaveURL(/\/dashboards/)
}

test.describe('Public landing page', () => {
  test('should load without authentication', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/')
  })
})

test.describe('Route protection', () => {
  test('should redirect an unauthenticated visitor from a protected dashboard to login', async ({ page }) => {
    await page.goto('/dashboards/admin/billing')
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Administrator login', () => {
  test('should log in and reach the dashboard picker', async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password)
    await expect(page).toHaveURL(/\/dashboards/)
    await expect(page.getByText('Admin User')).toBeVisible()
    await expect(page.getByText('ADMINISTRATOR')).toBeVisible()
  })

  test('should show an error for an incorrect password', async ({ page }) => {
    await submitLoginForm(page, ADMIN.email, 'wrong-password')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByText('Invalid email or password')).toBeVisible()
  })

  test('should see real billing data on the Admin Billing dashboard', async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password)
    await page.goto('/dashboards/admin/billing')
    await expect(page.getByText('Billing Overview')).toBeVisible()
    await expect(page.getByText('Total Charges')).toBeVisible()
  })

  test('should be able to sign out', async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password)
    await page.getByRole('button', { name: 'Sign out' }).click()
    await expect(page).toHaveURL(/\/login/)

    await page.goto('/dashboards/admin/billing')
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Student login', () => {
  test('should log in and see their own payment dashboard', async ({ page }) => {
    await login(page, STUDENT.email, STUDENT.password)
    await expect(page).toHaveURL(/\/dashboards/)

    await page.goto('/dashboards/student')
    await expect(page.getByText('Payment Dashboard')).toBeVisible()
    await expect(page.getByText('Outstanding Balance')).toBeVisible()
  })

  test('should be redirected away from an administrator-only dashboard', async ({ page }) => {
    await login(page, STUDENT.email, STUDENT.password)
    await page.goto('/dashboards/admin/billing')
    await expect(page).toHaveURL(/\/dashboards$/)
  })
})
