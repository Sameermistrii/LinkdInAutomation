import cron from "node-cron";
import { publishDuePosts } from "../lib/publish";

async function tick() {
  try {
    const results = await publishDuePosts();
    if (results.length) {
      console.log(`[worker] processed ${results.length} post(s)`, results);
    }
  } catch (err) {
    console.error("[worker] tick failed", err);
  }
}

console.log("[worker] checking due posts every minute");
void tick();
cron.schedule("* * * * *", () => {
  void tick();
});
