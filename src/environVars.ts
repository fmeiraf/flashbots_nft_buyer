import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "..", "src/.env") });

export const BOT_PRIVATE_KEY: string = String(process.env["BOT_PRIVATE_KEY"]);
