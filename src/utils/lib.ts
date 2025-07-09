export const splitStringInMiddle = (
  str: string,
  visibleChars: number = 4
): string => {
  if (str.length <= visibleChars * 2) {
    return str;
  }
  const firstPart = str.slice(0, visibleChars);
  const secondPart = str.slice(-visibleChars);

  return `${firstPart}...${secondPart}`;
};
