/** Client-safe formatting helpers for cover letters. */

export function buildFromBlock(info: Record<string, unknown> | undefined): string | undefined {
  if (!info) return undefined;
  const lines: string[] = [];
  if (typeof info.fullName === "string" && info.fullName) lines.push(info.fullName);
  const city = typeof info.city === "string" ? info.city : "";
  const country = typeof info.country === "string" ? info.country : "";
  if (city && country) lines.push(`${city}, ${country}`);
  else if (city) lines.push(city);
  else if (country) lines.push(country);
  if (typeof info.email === "string" && info.email) lines.push(info.email);
  if (typeof info.phone === "string" && info.phone) lines.push(info.phone);
  if (typeof info.website === "string" && info.website) lines.push(info.website);
  return lines.length ? lines.join("\n") : undefined;
}
