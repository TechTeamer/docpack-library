module.exports = {
  env: {
    browser: false,
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: ["eslint:recommended", "plugin:n/recommended"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "script"
  },
  plugins: ["node"],
  rules: {
    curly: ["error", "all"],
    "brace-style": ["error", "1tbs", { allowSingleLine: true }],
    "guard-for-in": "error",
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": "error",
    "radix": "error",
    "n/no-deprecated-api": "warn",
    "n/no-process-exit": "off",
    "no-empty-function": "error",
    "no-shadow": "warn",
    "indent": ["error", 2],
    "max-len": ["error", { code: 240 }],
    "no-trailing-spaces": "error",
    "eol-last": ["error", "always"],
    "unicode-bom": ["error", "never"],
    "semi": ["error", "never"]
  },
  ignorePatterns: ["/node_modules/", "/dist/"],
  overrides: [
    {
      files: ["src/**/*.js"],
      env: {
        node: true,
        es2021: true,
      },
      parserOptions: {
        ecmaVersion: 12,
      },
      rules: {
        "no-undef": "off",
      },
    },
  ],
}
