import { z } from "zod";

const Z_RESPONSE = z.object({
  deletedTokens: z.object({
    count: z.number()
  })
});

//runs on build and compilation and calls the api to cleanup old session tokens
export function register() {
  void (async ()=>{
    try {
      const response = Z_RESPONSE.parse(await (await fetch(new URL("/api/tokens", process.env.BASE_URL), {
        method: "DELETE",
        mode: "cors",
        cache: "default"
      })).json());
      console.log("Ran session token cleanup", response);
    }
    catch(e: unknown) {
      console.log("SessionToken cleanup error", e);
    }
  })();
}