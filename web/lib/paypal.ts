const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_ENV = process.env.PAYPAL_ENV || "sandbox";

type PayPalEnv = "sandbox" | "live";

function getPayPalBaseUrl(env: PayPalEnv) {
  return env === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

function requirePayPalEnv() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal credentials are not configured.");
  }
}

async function getPayPalAccessToken() {
  requirePayPalEnv();
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

  const response = await fetch(`${getPayPalBaseUrl(PAYPAL_ENV as PayPalEnv)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }).toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayPal access token error: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export async function getPayPalClientToken() {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalBaseUrl(PAYPAL_ENV as PayPalEnv)}/v1/identity/generate-token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: "{}"
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayPal client token error: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as { client_token: string };
  return data.client_token;
}

export async function paypalFetch(path: string, options: RequestInit = {}) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalBaseUrl(PAYPAL_ENV as PayPalEnv)}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayPal API error: ${response.status} ${errorText}`);
  }

  return response.json();
}
