import Solution from "./Solution";
import cache from "../cache";
import Service from "../Service";

export default class S1 extends Solution {


    async initSecKill(count, saleId) {
        let redisKey = `${cache.secKillPrefix}:${saleId}`;
        let redisKey_list = `${redisKey}:s1:list`;
        let redisKey_access = `${redisKey}:s1:access`;
        await cache.redis.multi()
            .del(redisKey_access)
            .del(redisKey_list).lpush(redisKey_list, new Array(count).fill(1))
            .exec();
    }

    async secKill(userID, saleId) {

        let saleInfo = await this.service.getSaleInfo(saleId), now = Date.now();
        if (now < saleInfo.startTime || now > saleInfo.endTime) return Service.secKillStatus.NotInTime;

        let redisKey_list = `${saleInfo.redisKey}:s1:list`;
        let redisKey_access = `${saleInfo.redisKey}:s1:access`;
        if (await cache.redis.sismember(redisKey_access, `${userID}`)) return Service.secKillStatus.Fail;
        let saleItemId = await cache.redis.lpop(redisKey_list);
        if (!saleItemId) return Service.secKillStatus.Fail;
        return await cache.redis.sadd(redisKey_access, userID) ? Service.secKillStatus.Success : Service.secKillStatus.Fail;
        //todo 把成功结果存入数据库
    }

}