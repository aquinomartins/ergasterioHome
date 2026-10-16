import { defineConfig } from '@playwright/test';
import base from './playwright.config.js';

export default defineConfig({
  ...base,
  testDir: './tests/hosting',
  use: { ...base.use, baseURL: 'http://127.0.0.1:5182' },
  webServer: {
    command: 'node tests/static-root-server.mjs',
    url: 'http://127.0.0.1:5182',
    reuseExistingServer: false,
  },
});
