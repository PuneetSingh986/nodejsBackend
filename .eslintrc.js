module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
    jest: true,
  },
  extends: ["airbnb-base"],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "warn",
    "no-unused-vars": ["error", { argsIgnorePattern: "next" }],
    "consistent-return": "off",
    "no-underscore-dangle": "off",
    "func-names": "off",
    "max-len": ["error", { code: 100, ignoreComments: true }],
  },
};
