import bcrypt from "bcrypt";

export async function hashPassword(unhashedPassword: string) {
  const hashedPassword = await bcrypt.hash(unhashedPassword, 12); //12 rounds should result in ~250ms hashing time

  return hashedPassword;
}

export async function comparePassword(unhashedPassword: string, hashedPassword: string) {
  return await bcrypt.compare(unhashedPassword, hashedPassword);
}