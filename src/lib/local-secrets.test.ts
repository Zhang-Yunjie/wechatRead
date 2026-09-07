import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  clearLocalWeReadKey,
  getWeReadCredentialStatus,
  resolveWeReadKey,
  saveLocalWeReadKey,
} from "./local-secrets";

describe("local WeRead credential store", () => {
  const directories: string[] = [];

  function secretPath() {
    const directory = mkdtempSync(join(tmpdir(), "reading-secrets-"));
    directories.push(directory);
    return join(directory, "secrets.json");
  }

  afterEach(() => {
    for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
  });

  it("atomically saves a trimmed key with owner-only permissions", () => {
    const filePath = secretPath();

    saveLocalWeReadKey("  wrk-local-12345678  ", { filePath });

    expect(JSON.parse(readFileSync(filePath, "utf8"))).toEqual({ wereadApiKey: "wrk-local-12345678" });
    expect(statSync(filePath).mode & 0o777).toBe(0o600);
  });

  it("returns only a masked local status", () => {
    const filePath = secretPath();
    saveLocalWeReadKey("wrk-local-12345678", { filePath });

    expect(getWeReadCredentialStatus({ filePath, env: {} })).toEqual({
      configured: true,
      source: "local",
      maskedKey: "••••5678",
    });
  });

  it("clears only the local WeRead key", () => {
    const filePath = secretPath();
    writeFileSync(filePath, JSON.stringify({ wereadApiKey: "wrk-local-12345678", futureSetting: "keep" }));

    clearLocalWeReadKey({ filePath });

    expect(JSON.parse(readFileSync(filePath, "utf8"))).toEqual({ futureSetting: "keep" });
  });

  it("falls back to the environment after a corrupted local file", () => {
    const filePath = secretPath();
    writeFileSync(filePath, "not-json");

    expect(resolveWeReadKey({ filePath, env: { WEREAD_API_KEY: "wrk-env-87654321" } })).toBe("wrk-env-87654321");
    expect(getWeReadCredentialStatus({ filePath, env: { WEREAD_API_KEY: "wrk-env-87654321" } })).toEqual({
      configured: true,
      source: "environment",
      maskedKey: "••••4321",
    });
  });

  it("rejects an empty key", () => {
    expect(() => saveLocalWeReadKey("   ", { filePath: secretPath() })).toThrow("API Key 不能为空");
  });
});
