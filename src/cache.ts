const Redis = require("ioredis");
let redisAddress = process.env.redisAddress || "127.0.0.1";

export default class cache {
    static secKillPrefix = "secKill";
    static saleId = "MeIsLZHua";

    static redis = new Redis(redisAddress);

}

