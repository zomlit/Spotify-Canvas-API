import axios from "axios";
import * as OTPAuth from "otpauth";
import dotenv from "dotenv";

dotenv.config();

const SP_DC = process.env.SP_DC;
const SECRETS_URL = "https://raw.githubusercontent.com/xyloflake/spot-secrets-go/refs/heads/main/secrets/secretDict.json";

// Global variables to store the current TOTP configuration
let currentTotp = null;
let currentTotpVersion = null;
let lastFetchTime = 0;
const FETCH_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

export class SpotifyAuthError extends Error {
  constructor(message, { status, body, cause } = {}) {
    super(message);
    this.name = "SpotifyAuthError";
    this.stage = "token";
    this.status = status;
    this.body = body;
    this.cause = cause;
  }
}

// Initialize TOTP secrets on startup
initializeTOTPSecrets();

// Set up periodic updates
setInterval(updateTOTPSecrets, FETCH_INTERVAL);

async function initializeTOTPSecrets() {
  try {
    await updateTOTPSecrets();
  } catch (error) {
    console.error('Failed to initialize TOTP secrets:', error);
    // Fallback to the original hardcoded secret
    useFallbackSecret();
  }
}

async function updateTOTPSecrets() {
  try {
    const now = Date.now();
    if (now - lastFetchTime < FETCH_INTERVAL) {
      return; // Don't fetch too frequently
    }

    console.log('Fetching updated TOTP secrets...');
    const secrets = await fetchSecretsFromGitHub();
    const newestVersion = findNewestVersion(secrets);
    
    if (newestVersion && newestVersion !== currentTotpVersion) {
      const secretData = secrets[newestVersion];
      const totpSecret = createTotpSecret(secretData);
      
      currentTotp = new OTPAuth.TOTP({
        period: 30,
        digits: 6,
        algorithm: "SHA1",
        secret: totpSecret
      });
      
      currentTotpVersion = newestVersion;
      lastFetchTime = now;
      console.log(`TOTP secrets updated to version ${newestVersion}`);
    } else {
      console.log(`No new TOTP secrets found, using version ${newestVersion}`);
    }
  } catch (error) {
    console.error('Failed to update TOTP secrets:', error);
    // Keep using current TOTP if available, otherwise use fallback
    if (!currentTotp) {
      useFallbackSecret();
    }
  }
}

async function fetchSecretsFromGitHub() {
  try {
    const response = await axios.get(SECRETS_URL, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch secrets from GitHub:', error.message);
    throw error;
  }
}

function findNewestVersion(secrets) {
  const versions = Object.keys(secrets).map(Number);
  return Math.max(...versions).toString();
}

function createTotpSecret(data) {
  const mappedData = data.map((value, index) => value ^ ((index % 33) + 9));
  const hexData = Buffer.from(mappedData.join(""), "utf8").toString("hex");
  return OTPAuth.Secret.fromHex(hexData);
}

function useFallbackSecret() {
  // Fallback to the original hardcoded secret
  // This secret will most likely fail because Spotify is rotating the secrets every couple of days
  // This is really just kept in here for reference
  const fallbackData = [99, 111, 47, 88, 49, 56, 118, 65, 52, 67, 50, 104, 117, 101, 55, 94, 95, 75, 94, 49, 69, 36, 85, 64, 74, 60];
  const totpSecret = createTotpSecret(fallbackData);
  
  currentTotp = new OTPAuth.TOTP({
    period: 30,
    digits: 6,
    algorithm: "SHA1",
    secret: totpSecret
  });
  
  currentTotpVersion = "19"; // Fallback version
  console.log('Using fallback TOTP secret');
}

export async function getToken() {
  // Ensure we have a TOTP instance
  if (!currentTotp) {
    await initializeTOTPSecrets();
  }

  if (!SP_DC) {
    throw new SpotifyAuthError("Missing SP_DC environment variable");
  }

  const serverTime = await getServerTime();
  const otp = generateTOTP(serverTime * 1000);

  for (const reason of ["transport", "init"]) {
    try {
      const payload = generateAuthPayload(reason, otp);
      const url = new URL("https://open.spotify.com/api/token");
      Object.entries(payload).forEach(([key, value]) => url.searchParams.append(key, value));

      const response = await axios.get(url.toString(), {
        headers: {
          'User-Agent': userAgent(),
          'Accept': 'application/json',
          'Referer': 'https://open.spotify.com/',
          'App-Platform': 'WebPlayer',
          'Cookie': `sp_dc=${SP_DC}`,
        },
      });

      const token = response.data?.accessToken;
      if (token) {
        return token;
      }
    } catch (error) {
      if (reason === "init") {
        throw new SpotifyAuthError("Spotify token request failed", {
          status: error.response?.status,
          body: responseBody(error.response?.data),
          cause: error,
        });
      }
    }
  }

  throw new SpotifyAuthError("Spotify token response did not include an access token");
}

function generateAuthPayload(reason, otp) {
  return {
    reason,
    productType: "web-player",
    totp: otp,
    totpVer: currentTotpVersion || "19",
    totpServer: otp
  };
}

async function getServerTime() {
  try {
    const { headers } = await axios.head("https://open.spotify.com/", {
      headers: {
        'User-Agent': userAgent(),
        'Accept': '*/*',
      },
    });

    const time = Date.parse(headers.date);
    if (isNaN(time)) throw new Error("Invalid server time");
    return Math.floor(time / 1000);
  } catch {
    return Math.floor(Date.now() / 1000);
  }
}

function generateTOTP(timestamp) {
  if (!currentTotp) {
    throw new Error("TOTP not initialized");
  }
  return currentTotp.generate({ timestamp });
}

function userAgent() {
  return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36";
}

function responseBody(data) {
  if (data == null) return undefined;
  if (Buffer.isBuffer(data) || data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
    return Buffer.from(data).toString("utf8").slice(0, 500);
  }
  if (typeof data === "string") {
    return data.slice(0, 500);
  }
  return JSON.stringify(data).slice(0, 500);
}
