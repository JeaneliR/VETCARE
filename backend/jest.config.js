const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  testMatch: ["**/tests/**/*.test.ts"],
  // Carga backend/.env.test antes que nada (incluso antes de que las pruebas
  // importen src/app.ts), para que las suites de integración/seguridad usen
  // su propia base de datos (vetcare_test) y no la de desarrollo.
  setupFiles: ["<rootDir>/tests/setupEnv.js"],
  collectCoverageFrom: ["src/**/*.ts", "!src/index.ts", "!src/types/**"],
  coverageDirectory: "coverage",
};