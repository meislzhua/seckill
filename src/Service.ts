import Solution from "./solution/Solution";
import cache from "./cache";

enum secKillStatus {
    Success = 1,
    Fail = 2,
    NotInTime = 3,
}

export default class Service {
    static readonly secKillStatus = secKillStatus;
    private solution: Solution = null;
    startTime = null;
    endTime = null;
    count = null;

    //这里默认随意默认一个id,不再从其他地方获取ID,方便演示
    static saleId = "MeIsLZHua";


    constructor(solution: Solution) {
        this.solution = solution;
        solution.service = this;
    }

    async init(startTime = Date.now(), endTime = Date.now(), count = 10, saleId = Service.saleId) {
        let redisKey = `${cache.secKillPrefix}:${saleId}`;

        await cache.redis.multi()
            .del(redisKey)
            .hset(redisKey, "startTime", startTime, "endTime", endTime, "count", count)
            .exec();
        await this.solution.initSecKill(count, saleId);
        this.startTime = startTime;
        this.endTime = endTime;
        this.count = count;
    }

    async getSaleInfo(saleId: string = cache.saleId) {
        let redisKey = this.getRedisKey(saleId);
        let data = await cache.redis.hmget(redisKey, "startTime", "endTime", "count");
        return {
            redisKey,
            startTime: data[0] * 1,
            endTime: data[1] * 1,
            count: data[2] * 1,
        }
    }
     getRedisKey(saleId){
         return `${cache.secKillPrefix}:${saleId}`
     }

    async getSale(userId = Math.random(),saleId: string = cache.saleId) {

        //执行执行具体算法
        return await this.solution.secKill(userId, saleId);
    }
}