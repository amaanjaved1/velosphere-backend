module.exports = {
  transform: {
    "^.+\\.(js|jsx|mjs)$": "babel-jest",
  },
  moduleFileExtensions: ["js", "json", "jsx", "mjs"],
  testMatch: [
    "<rootDir>/__tests__/controllers/**/*.test.(js|jsx|mjs)",
    "<rootDir>/__tests__/controllers/**/*.spec.(js|jsx|mjs)",
  ],
};
