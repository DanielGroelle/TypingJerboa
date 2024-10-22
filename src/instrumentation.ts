import { CronJob } from "cron";
import prisma from "@/lib/prisma";

//on build, start cron job for session token cleanup
//actually minorly errors on each compile, because it cant find the cron module
//but somehow it works anyways?
export function register() {
  void (async ()=>{
    try {
      CronJob.from({
        cronTime: "0 0 12 * * *", //will run every day at 12pm
        onTick: async () => {
          const deletedTokens = await prisma.session.deleteMany({
            where: {
              expiry: {
                lte: new Date()
              }
            }
          });
          if (!deletedTokens) {
            console.log("Error deleting sessionTokens");
          }

          console.log("Ran session token cleanup", deletedTokens);
        },
        start: true,
        timeZone: "America/Los_Angeles"
      });

      console.log("Started cron job");
    }
    catch(e: unknown) {
      console.log("Instrumentation error", e);
    }
  })();
}