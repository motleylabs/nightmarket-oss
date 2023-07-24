export function hideTokenDetails(str: string, isTwoDotted?: boolean): string {
  const firstFour = str.slice(0, 4);
  const lastFour = str.slice(-4);

  return `${firstFour}..${isTwoDotted ? '' : '..'}${lastFour}`;
}
