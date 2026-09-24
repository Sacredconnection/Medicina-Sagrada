import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  use: { baseURL: "http://127.0.0.1:3017", channel: "chrome", headless: true, trace: "retain-on-failure" },
  webServer: [
    { command: "node tests/fixtures/woo-server.mjs", url: "http://127.0.0.1:4010/health", reuseExistingServer: false },
    { command: "npm run dev -- --hostname 127.0.0.1 --port 3017", url: "http://127.0.0.1:3017/cart/", timeout: 120_000, reuseExistingServer: false,
      env: {
        NEXT_DIST_DIR: ".next-e2e",
        NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3017",
        WORDPRESS_SITE_URL: "http://127.0.0.1:4010",
        WORDPRESS_API_URL: "http://127.0.0.1:4010/wp-json",
        WOOCOMMERCE_STORE_API_URL: "http://127.0.0.1:4010/wp-json/wc/store/v1",
        WOOCOMMERCE_CHECKOUT_URL: "http://127.0.0.1:4010/checkout/",
        WOOCOMMERCE_ACCOUNT_URL: "http://127.0.0.1:4010/account/",
      },
    },
  ],
});
