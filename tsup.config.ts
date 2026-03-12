import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      react: 'src/react.tsx',
      server: 'src/server.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    external: ['react'],
  },
]);
