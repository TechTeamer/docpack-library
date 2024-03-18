module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: ["eslint:recommended", "plugin:react/recommended", "plugin:n/recommended"],
  parserOptions: {
    requireConfigFile: false,
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: ["react", "node"],
  rules: {
    curly: ["error", "all"],
    "brace-style": ["error", "1tbs", { allowSingleLine: false }],
    "guard-for-in": "error",
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": "error",
    "radix": "error",
    "n/no-deprecated-api": "warn",
    "n/no-process-exit": "off",
    "no-process-exit": "off",
    "n/shebang": "off",
    "no-empty-function": "error",
    "no-shadow": "warn",
    "indent": ["error", 2],
    "max-len": ["error", { code: 240 }],
    "no-trailing-spaces": "error",
    "eol-last": ["error", "always"],
    "unicode-bom": ["error", "never"],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  overrides: [
    {
      // FRONTED RULES
      files: ["src/client/**/*.js", "src/client/**/*.jsx"],
      rules: {
        "n/no-missing-import": "off",
      },
    },
    {
      // WEBPACK RULES
      files: ["webpack.config.js"],
      env: {
        node: true,
      },
      rules: {
        "no-undef": "off",
        "n/no-missing-import": "off",
        "n/no-unpublished-require": "off",
      },
    },
    {
      // BACKEND RULES
      files: ["src/server/**/*.js"],
      env: {
        node: true,
        es2021: true,
      },
      parserOptions: {
        ecmaVersion: 12,
        sourceType: "script",
      },
      rules: {
        "no-undef": "off",
      },
    },
  ],
};
