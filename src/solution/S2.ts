import Solution from "./Solution";
import cache from "../cache";
import Service from "../Service";

export default class S2 extends Solution {


    async initSecKill(count, saleId) {
        await cache.redis.del(`${cache.secKillPrefix}:${saleId}:s2:access`);
    }


    async secKill(userID, saleId) {

        let saleInfo = await this.service.getSaleInfo(saleId), now = Date.now();
        if (now < saleInfo.startTime || now > saleInfo.endTime) return Service.secKillStatus.NotInTime;

        let redisKey_access = `${saleInfo.redisKey}:s2:access`;
        if (await cache.redis.zcard(redisKey_access) >= saleInfo.count) return Service.secKillStatus.Fail;
        await cache.redis.zadd(redisKey_access, Date.now(), userID);
        return Service.secKillStatus.Success;
    }

}