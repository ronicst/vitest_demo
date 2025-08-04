import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.js',
        'src/main.jsx',
        'src/index.css',
        'src/App.css',
        '**/*.config.js',
        '**/*.config.ts',
        'coverage/**',
        'dist/**',
        'build/**',
      ],
    },
  },
}); 