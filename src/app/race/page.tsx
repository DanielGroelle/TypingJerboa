import ClientRace from "./client-page";
import { cookies } from "next/headers";

export default function Race() {
  const userCookies = cookies();
  const languageScriptPreference = userCookies.get("languageScriptPreference")?.value;
  
  return (
    <ClientRace languageScriptPreference={languageScriptPreference} />
  );
}