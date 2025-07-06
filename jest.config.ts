import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jest-environment-node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  extensionsToTreatAsEsm: [".ts"],
  preset: "ts-jest/presets/default-esm",
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      useESM: true,
    }],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};

export default config;
