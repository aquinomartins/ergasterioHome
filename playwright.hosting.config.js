import { defineConfig } from '@playwright/test';
import base from './playwright.config.js';

export default defineConfig({
  ...base,
  testDir: './tests/hosting',
  use: { ...base.use, baseURL: 'http://127.0.0.1:5181' },
  webServer: {
    command: 'npm run preview -- --mode hosting --port 5181 --strictPort',
    url: 'http://127.0.0.1:5181',
    reuseExistingServer: false,
  },
});
