//on build, start cron job for session token cleanup
export async function register() {
  //need to make sure register is being run in a nodejs environment for imports to function
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { CronJob } = await import("cron");
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

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
}