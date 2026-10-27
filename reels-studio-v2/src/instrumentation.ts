export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startTelegramDeliveryWorker } = await import("./lib/telegram");
    startTelegramDeliveryWorker();
    if(process.env.STORY_LOCAL_SERVICE === "1") {
      const {recoverLocalBatches} = await import("./lib/localRenderQueue");
      recoverLocalBatches();
    }
  }
}
