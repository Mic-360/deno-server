import { MongoClient } from "https://deno.land/x/mongo/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

const env = config();

const Client = new MongoClient();

await Client.connect(env.MONGO_URI);

export const db = Client.database("deno");
