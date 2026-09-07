import { randomUUID } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";

type SecretOptions = {
  filePath?: string;
  env?: Record<string, string | undefined>;
};

type LocalSecrets = Record<string, unknown> & {
  wereadApiKey?: string;
};

export type WeReadCredentialStatus = {
  configured: boolean;
  source: "local" | "environment" | null;
  maskedKey: string | null;
};

function getSecretPath(options: SecretOptions = {}) {
  return options.filePath ?? process.env.READING_SECRETS_PATH?.trim() ?? "data/secrets.json";
}

function readSecrets(filePath: string): LocalSecrets {
  try {
    const value: unknown = JSON.parse(readFileSync(filePath, "utf8"));
    return value && typeof value === "object" && !Array.isArray(value) ? value as LocalSecrets : {};
  } catch {
    return {};
  }
}

function writeSecrets(filePath: string, secrets: LocalSecrets) {
  const directory = path.dirname(filePath);
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const temporaryPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temporaryPath, `${JSON.stringify(secrets, null, 2)}\n`, { encoding: "utf8", mode: 0o600, flag: "wx" });
    renameSync(temporaryPath, filePath);
    chmodSync(filePath, 0o600);
  } finally {
    if (existsSync(temporaryPath)) unlinkSync(temporaryPath);
  }
}

export function saveLocalWeReadKey(apiKey: string, options: SecretOptions = {}) {
  const trimmed = apiKey.trim();
  if (!trimmed) throw new Error("API Key 不能为空");
  const filePath = getSecretPath(options);
  writeSecrets(filePath, { ...readSecrets(filePath), wereadApiKey: trimmed });
}

export function clearLocalWeReadKey(options: SecretOptions = {}) {
  const filePath = getSecretPath(options);
  if (!existsSync(filePath)) return;
  const secrets = readSecrets(filePath);
  delete secrets.wereadApiKey;
  if (Object.keys(secrets).length === 0) unlinkSync(filePath);
  else writeSecrets(filePath, secrets);
}

export function resolveWeReadKey(options: SecretOptions = {}) {
  const localKey = readSecrets(getSecretPath(options)).wereadApiKey?.trim();
  if (localKey) return localKey;
  return (options.env ?? process.env).WEREAD_API_KEY?.trim() || undefined;
}

function maskKey(apiKey: string) {
  return apiKey.length > 4 ? `••••${apiKey.slice(-4)}` : "••••";
}

export function getWeReadCredentialStatus(options: SecretOptions = {}): WeReadCredentialStatus {
  const localKey = readSecrets(getSecretPath(options)).wereadApiKey?.trim();
  if (localKey) return { configured: true, source: "local", maskedKey: maskKey(localKey) };
  const environmentKey = (options.env ?? process.env).WEREAD_API_KEY?.trim();
  if (environmentKey) return { configured: true, source: "environment", maskedKey: maskKey(environmentKey) };
  return { configured: false, source: null, maskedKey: null };
}
