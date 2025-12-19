import _import from "eslint-plugin-import";
import unicorn from "eslint-plugin-unicorn";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import { fixupPluginRules } from "@eslint/compat";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const compat = new FlatCompat({
  baseDirectory: dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends("plugin:@typescript-eslint/recommended", "prettier"),
  {
    plugins: {
      import: fixupPluginRules(_import),
      unicorn,
      "@typescript-eslint": typescriptEslint,
    },
    languageOptions: {
      globals: Object.fromEntries(
        Object.entries({
          ...globals.commonjs,
          ...globals.node,
          ...globals.browser,
        }).map(([key, value]) => [key.trim(), value]),
      ),
      ecmaVersion: "latest",
      sourceType: "module",
    },
    settings: {
      "import/parsers": {
        "@typescript-eslint/parser": [".ts"],
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: ["./tsconfig.json"],
        },
      },
    },
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE"],
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variable",
          format: ["camelCase"],
        },
        {
          selector: "variable",
          modifiers: ["const"],
          format: ["UPPER_CASE", "camelCase"],
        },
      ],
      quotes: [
        2,
        "double",
        {
          avoidEscape: true,
          allowTemplateLiterals: true,
        },
      ],
      "max-len": [
        "error",
        {
          code: 120,
          ignoreComments: true,
          ignorePattern: "^import\\s.+\\sfrom\\s.+;$",
        },
      ],
      "linebreak-style": 0,
      curly: ["error", "all"],
      "comma-dangle": [
        "error",
        {
          arrays: "always-multiline",
          objects: "always-multiline",
          imports: "always-multiline",
          exports: "never",
          functions: "never",
        },
      ],
      "class-methods-use-this": "off",
      "no-restricted-syntax": "off",
      "no-plusplus": "off",
      "operator-linebreak": "off",
      radix: "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "import/newline-after-import": [
        "error",
        {
          count: 1,
        },
      ],
      "lines-around-comment": [
        "error",
        {
          beforeLineComment: false,
          beforeBlockComment: true,
          allowBlockStart: true,
          allowClassStart: true,
          allowObjectStart: true,
          allowArrayStart: true,
        },
      ],
      "newline-before-return": "error",
      "unicorn/filename-case": [
        "error",
        {
          case: "kebabCase",
        },
      ],
      "unicorn/prevent-abbreviations": [
        "warn",
        {
          allowList: {
            id: true,
            URL: true,
            API: true,
            params: true,
            Params: true,
            param: true,
            Param: true,
            keyParam: true,
            args: true,
            req: true,
            res: true,
            Obj: true,
            obj: true,
            Req: true,
            i: true,
          },
          checkFilenames: false,
        },
      ],
    },
  },
  {
    files: ["packages/**/*.ts"],

    rules: {
      "@typescript-eslint/no-var-requires": "off",
    },
  },
];
