import "reflect-metadata";
import { app } from "./app";
import { env } from "./config/env";

async function bootstrap(): Promise<void> {
  try {
    app.listen(env.port);
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

void bootstrap();
