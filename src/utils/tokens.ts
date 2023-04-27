export function hideTokenDetails(str: string): string {
  const firstFour = str.slice(0, 4);
  const lastFour = str.slice(-4);

  return `${firstFour}....${lastFour}`;
}
