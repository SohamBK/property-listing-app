import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    {
        files: ['**/*.{js,mjs}'],
        extends: [js.configs.recommended, configPrettier],
        plugins: {
            prettier,
        },
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.node,
        },
        rules: {
            'prettier/prettier': 'error',
            'no-unused-vars': 'warn',
            'no-console': 'off',
        },
    },
]);
