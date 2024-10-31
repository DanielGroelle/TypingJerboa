import ClientLearn from "./client-page";
import { cookies } from "next/headers";

export default function Learn() {
  const userCookies = cookies();
  const languageScriptPreference = userCookies.get("languageScriptPreference")?.value;

  return (
    <ClientLearn languageScriptPreference={languageScriptPreference} />
  );
}