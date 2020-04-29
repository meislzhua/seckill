import Solution from "./solution/Solution";
import cache from "./cache";

export enum SecKillStatus {
    Success = 1,
    Fail = 2,
    NotInTime = 3,
    StockNotSufficient = 4,
    Over = 5,
}


export default class Service {
    solution: Solution = null;
    startTime = null;
    endTime = null;
    count = null;
    singleMax = null;
    soldOut = null;

    userList = [];

    //这里默认随意默认一个id,不再从其他地方获取ID,方便演示
    static saleId = "MeIsLZHua";


    constructor(solution: Solution) {
        this.solution = solution;
        this.solution.setService(this);
    }

    async init(startTime = Date.now(), endTime = Date.now(), count = 10, singleMax = 1, saleId = Service.saleId) {
        let redisKey = `${cache.secKillPrefix}:${saleId}`;
        let key_soldOut = `${cache.secKillPrefix}:${saleId}:soldOut`;

        this.userList = new Array(count * 5).fill(1).map(v => Math.random());

        await cache.redis.multi()
            .del(redisKey)
            .del(key_soldOut)
            .hset(redisKey, "startTime", startTime, "endTime", endTime, "count", count, "singleMax", singleMax, "soldOut", 0)
            .exec();
        await this.solution.initSecKill(saleId);
        this.startTime = startTime;
        this.endTime = endTime;
        this.count = count;             //本次秒杀总数
        this.singleMax = singleMax;     //单人秒杀最多购买数
    }

    async setSold(userId: string, saleId: string, number: number): Promise<number> {
        return await cache.redis.hincrby(Service.getRedisSoldOutKey(saleId), userId, number) * 1;
    }

    async getSold(userId, saleId = Service.saleId) {
        return cache.redis.hget(Service.getRedisSoldOutKey(saleId), userId) * 1;
    }

    async getSaleInfo(saleId: string = cache.saleId) {
        let redisKey = Service.getRedisKey(saleId);
        let data = await cache.redis.hmget(redisKey, "startTime", "endTime", "count", "singleMax", "soldOut");
        //todo 抽象化SaleInfo
        return {
            startTime: data[0] * 1,
            endTime: data[1] * 1,
            count: data[2] * 1,
            singleMax: data[3] * 1,
            soldOut: data[4] * 1,
        }
    }

    static getRedisKey(saleId) {
        return `${cache.secKillPrefix}:${saleId}`
    }

    static getRedisSoldOutKey(saleId) {
        return `${Service.getRedisKey(saleId)}:soldOut`;
    }

    async getSale(number: number, userId: string, saleId: string = cache.saleId) {
        //执行执行具体算法
        return await this.solution.secKill(userId, saleId, number);
    }

    getRandomUser() {
        return this.userList[this.userList.length * Math.random() | 0];
    }

    getRandomCount(): number {
        return (this.singleMax + 1) * Math.random() | 0 || 1;
    }
}