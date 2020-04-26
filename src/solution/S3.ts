import Solution from "./Solution";
import cache from "../cache";
import Service from "../Service";

export default class S3 extends Solution {
    i = 2;

    async initSecKill(count, saleId) {
        await cache.redis.del(`${this.service.getRedisKey(saleId)}:s3:access`);
    }


    async secKill(userID, saleId) {

        let redisKey = this.service.getRedisKey(saleId);
        let redisKey_access = `${redisKey}:s3:access`;
        let command = `
        local t = redis.call('time');
        local time = t[1]*1000 + t[2]/1000;
        local info = redis.call('hmget',KEYS[1],'startTime','endTime','count');
        if (time < tonumber(info[1]) or tonumber(info[2]) < time) then return 2 end;
        return redis.call('scard',KEYS[2]) < tonumber(info[3]) and redis.call('sadd',KEYS[2],'${userID}')`;
        let res = await cache.redis.eval(command, 2,redisKey,redisKey_access);
        if (res == 2) return Service.secKillStatus.NotInTime;
        return res ? Service.secKillStatus.Success : Service.secKillStatus.Fail;
    }

}