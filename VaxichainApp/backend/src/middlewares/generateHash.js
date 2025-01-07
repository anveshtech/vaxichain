import crypto from "crypto";

// Reusable function to generate SHA-256 hash
export const generateHash = (data) => {
  const dataString = JSON.stringify(data);
  return crypto.createHash("sha256").update(dataString).digest("hex");
};
