const Redis = require("ioredis");
let redisAddress = process.env.redisAddress || "192.168.204.1:31518";

export default class config {
    static redis = new Redis(redisAddress);
}

