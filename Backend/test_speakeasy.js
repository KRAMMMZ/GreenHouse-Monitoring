// test_speakeasy.js
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

async function test2FA() {
  // 1. Generate a secret
  const secret = speakeasy.generateSecret({ length: 20 });
  console.log("Generated Secret (Base32):", secret.base32);

  // 2. Generate a QR Code (optional, but good for testing)
  const otpauthUrl = speakeasy.otpauthURL({
    secret: secret.base32,
    label: 'TestUser@TestApp',
    issuer: 'TestApp',
  });
  const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl);
  console.log("QR Code Data URL (for setup):", qrCodeDataURL);

    // 3.  **IMPORTANT:**  Manually enter a token from your authenticator app here:
  const userToken = "999 021"; // <--- REPLACE THIS

  // 4. Verify the token
  const verified = speakeasy.totp.verify({
    secret: secret.base32,
    encoding: 'base32',
    token: userToken,
    window: 2, // Use the standard window
  });

  console.log("Verification Result:", verified);
}

test2FA();