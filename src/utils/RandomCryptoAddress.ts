export function generateRandomCryptoAddress(): string {
  // Generate a random string of 34 characters (you can adjust the length)
  const randomAddress = [...Array(34)]
    .map(() => Math.random().toString(36)[2])
    .join("");

  return randomAddress;
}
