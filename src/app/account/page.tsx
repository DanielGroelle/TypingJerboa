import ClientAccount from "./client-page";
import { cookies } from "next/headers";

export default function Account() {
  const userCookies = cookies();
  const languageScriptPreference = userCookies.get("languageScriptPreference")?.value;

  return (
    <ClientAccount languageScriptPreference={languageScriptPreference} />
  );
}