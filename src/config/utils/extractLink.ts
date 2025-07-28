export async function extractLink(input: string): Promise<string | null> {
  const regex = /(https?:\/\/[^\s]+)/;
  const match = input.match(regex);
  return match ? match[0] : null;
}
