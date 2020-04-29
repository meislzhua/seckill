import Service from "./Service";

const Redis = require("ioredis");
let redisAddress = process.env.redisAddress || "127.0.0.1";

export default class cache {
    static secKillPrefix = "secKill";
    static saleId = "MeIsLZHua";

    static redis = new Redis(redisAddress);

    //TODO cache的简单实现,并不能投入生产使用; 还涉及缓存更新,缓存清除等逻辑
    private static cache: any = {};

    static setSaleCache(saleCache) {
        this.cache[saleCache.saleId] = saleCache;
    }

    static async getSaleCache(saleId) {
        if (this.cache[saleId]) return this.cache[saleId];
        let data = await cache.redis.hmget(Service.getRedisKey(saleId), "startTime", "endTime", "count", "singleMax");

        return this.cache[saleId] = {
            startTime: data[0],
            endTime: data[1],
            count: data[2],
            singleMax: data[3]
        };
    }


}

