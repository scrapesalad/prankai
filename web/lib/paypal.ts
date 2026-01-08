const PAYPAL_ENV = (process.env.PAYPAL_ENV || "sandbox").trim();
const PAYPAL_CLIENT_ID = (
  PAYPAL_ENV === "live"
    ? process.env.PAYPAL_LIVE_CLIENT_ID || process.env.PAYPAL_CLIENT_ID
    : process.env.PAYPAL_SANDBOX_CLIENT_ID || process.env.PAYPAL_CLIENT_ID
)?.trim();
const PAYPAL_CLIENT_SECRET = (
  PAYPAL_ENV === "live"
    ? process.env.PAYPAL_LIVE_CLIENT_SECRET || process.env.PAYPAL_CLIENT_SECRET
    : process.env.PAYPAL_SANDBOX_CLIENT_SECRET || process.env.PAYPAL_CLIENT_SECRET
)?.trim();

type PayPalEnv = "sandbox" | "live";

function getPayPalBaseUrl(env: PayPalEnv) {
  return env === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

function requirePayPalEnv() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    const env = PAYPAL_ENV;
    const hasClientId = !!PAYPAL_CLIENT_ID;
    const hasClientSecret = !!PAYPAL_CLIENT_SECRET;
    throw new Error(
      `PayPal credentials are not configured. Environment: ${env}, Client ID: ${hasClientId ? "present" : "missing"}, Client Secret: ${hasClientSecret ? "present" : "missing"}`
    );
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
  
  console.log("Requesting PayPal client token from:", `${getPayPalBaseUrl(PAYPAL_ENV as PayPalEnv)}/v1/identity/generate-token`);
  
  // For PayPal SDK v6, we need to use the identity/generate-token endpoint
  // This should return a JWT token
  const response = await fetch(`${getPayPalBaseUrl(PAYPAL_ENV as PayPalEnv)}/v1/identity/generate-token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({})
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("PayPal client token API error:", {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    // Check if this is a credential/app type issue
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        `PayPal authentication failed. Please verify your Client ID and Secret are correct and that you're using REST API credentials (not Braintree). Status: ${response.status}`
      );
    }
    
    throw new Error(`PayPal client token error: ${response.status} ${errorText}`);
  }

  const responseText = await response.text();
  console.log("PayPal API raw response:", responseText.substring(0, 200));
  
  let data: { client_token?: string; clientToken?: string };
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    console.error("Failed to parse PayPal response as JSON:", responseText);
    throw new Error(`PayPal API returned invalid JSON: ${responseText.substring(0, 100)}`);
  }
  
  console.log("PayPal API parsed response:", {
    hasClientToken: !!data.client_token,
    hasClientTokenAlt: !!data.clientToken,
    keys: Object.keys(data),
    preview: JSON.stringify(data).substring(0, 200)
  });
  
  // PayPal API returns 'client_token' in the response
  const token = data.client_token || data.clientToken;
  
  if (!token) {
    console.error("PayPal response missing client token. Full response:", JSON.stringify(data, null, 2));
    throw new Error("PayPal API response missing client token. Please verify your app is configured for REST API (not Braintree).");
  }
  
  console.log("PayPal client token received:", {
    type: typeof token,
    length: token.length,
    preview: token.substring(0, 50),
    parts: token.split(".").length
  });
  
  // Validate it's a JWT (3 parts separated by dots)
  const parts = token.split(".");
  if (parts.length !== 3) {
    console.error("PayPal client token is not a valid JWT:", {
      tokenLength: token.length,
      tokenPreview: token.substring(0, 100),
      partsCount: parts.length,
      parts: parts.map((p, i) => ({ index: i, length: p.length, preview: p.substring(0, 20) }))
    });
    throw new Error(
      "PayPal client token is not a valid JWT. This usually means your PayPal app is configured for Braintree instead of REST API. Please create a new REST API app in the PayPal Developer Dashboard."
    );
  }
  
  return token;
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
