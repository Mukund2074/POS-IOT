import { defineConfig } from 'orval';
export default defineConfig({
    cmsBackend: {
        output: {
            mode: 'split',
            target: './src/shared/api/index.ts',
            schemas: './src/shared/api/models',
            client: 'axios',
            mock: false,
            prettier: true,
            override: {
                mutator: {
                    path: './src/shared/api/client.ts',
                    name: 'customFetcher',
                },
            },
        },
        hooks: {
            afterAllFilesWrite: 'prettier --write',
        },
        input: {
            target: 'http://localhost:3005/docs/openapi.json',
            override: {
                transformer: './scripts/orval-transformer.mjs',
            },
        },
    },
});
