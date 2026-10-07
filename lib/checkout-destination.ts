const invalidDestination = () => new Error("Não foi possível abrir o pagamento com segurança. Tente novamente em instantes.");

// Validate against the configured checkout, never against a URL from the response.
export function safeCheckoutDestination(
  value: unknown,
  expectedCheckout: string,
  { allowLocalHttp = false }: { allowLocalHttp?: boolean } = {},
) {
  if (typeof value !== "string") throw invalidDestination();
  let destination: URL;
  let expected: URL;
  try {
    destination = new URL(value);
    expected = new URL(expectedCheckout);
  } catch {
    throw invalidDestination();
  }
  const localHttp = allowLocalHttp && destination.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(destination.hostname);
  if (
    (destination.protocol !== "https:" && !localHttp) ||
    destination.origin !== expected.origin ||
    destination.pathname !== expected.pathname ||
    destination.username || destination.password || destination.hash ||
    !destination.searchParams.get("session")
  ) throw invalidDestination();
  return destination.toString();
}
