import Redis from "ioredis";
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/../.env" });

console.log("Redis URL:", process.env.REDIS_URL);

const redis = new Redis(process.env.REDIS_URL!);
export default redis;
