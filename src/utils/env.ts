export function getEnv(key: string, allowEmpty = false): string {
  const value = process.env[key];

  if (value === undefined || (!allowEmpty && value === "")) {
    throw new Error(`❌ Variable d'environnement manquante : ${key}`);
  }

  return value;
}
