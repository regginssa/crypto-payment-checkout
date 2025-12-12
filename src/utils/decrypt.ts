import CryptoJS from "crypto-js";

export default function decrypt(encryptedText: string, keyHex: string): string {
  const [ivHex, encryptedBase64] = encryptedText.split(":");
  if (!ivHex || !encryptedBase64) return "";

  const iv = CryptoJS.enc.Hex.parse(ivHex);
  const decrypted = CryptoJS.AES.decrypt(
    encryptedBase64,
    CryptoJS.enc.Hex.parse(keyHex),
    { iv, mode: CryptoJS.mode.CBC }
  );

  return decrypted.toString(CryptoJS.enc.Utf8);
}
