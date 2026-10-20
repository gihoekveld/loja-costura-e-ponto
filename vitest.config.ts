import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    env: {
      DATA_ENCRYPTION_KEY: process.env.DATA_ENCRYPTION_KEY || '295055710dccef3101ff10ed100d58661bd328060ad78a8a08c81876527200b8',
      CPF_HASH_PEPPER: process.env.CPF_HASH_PEPPER || '3feed99c87e51f1d1d72121662ce0824ce9e69513692e856420aa1b9203b5912',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
