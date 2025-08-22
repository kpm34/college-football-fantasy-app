import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended"
  ),
  {
    rules: {
      // Enforce layering: lib/** cannot import from components/**
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/components/**',
                '@components/**'
              ],
              message: 'Do not import UI from lib/**; keep layering clean.'
            }
          ],
          zones: [
            { target: './lib/**', from: '@/components/**' },
            { target: './lib/**', from: '@components/**' }
          ]
        }
      ]
    }
  }
];

export default eslintConfig;
