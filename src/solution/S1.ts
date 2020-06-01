import Solution from "./Solution";
import config from "../config";
import {SecKillStatus} from "../Service";
import SecKillInfo from "../SecKillInfo";

export default class S1 extends Solution {

    async init(info) {
        await Dao.init(info)
    }

    async secKill(userId: string, secKillId: string, number: number): Promise<SecKillStatus> {
        const secKillInfo = await Dao.getById(secKillId);
        const now = Date.now();
        let result = SecKillStatus.Success;

        //判断不适宜抢购的情况
        if (now < secKillInfo.startTime || now > secKillInfo.endTime) return SecKillStatus.NotInTime;     //不在情况时间内
        if (number + secKillInfo.soldOut > secKillInfo.count) return SecKillStatus.StockNotSufficient;    //抢购数量不足
        const sold = await Dao.getSoldCountByUser(secKillInfo, userId);    //该用户已经抢购的数量
        if (number + sold > secKillInfo.singleMax) return SecKillStatus.Over;                          //超出单人抢购限制

        //执行抢购操作
        const [sumSoldCount, userSoldCount] = await Dao.sold(secKillInfo, userId, number);

        //发生超卖的情况
        if (sumSoldCount > secKillInfo.count) result = SecKillStatus.StockNotSufficient;
        if (userSoldCount > secKillInfo.singleMax) result = SecKillStatus.Over; //因单人并发导致单人超卖的情况  ps:这部分应该在前置部分所过滤,这里考虑没被过滤的情况

        //回滚,不安全
        if (result !== SecKillStatus.Success) await Dao.sold(secKillInfo, userId, -number);

        //todo 把成功结果存入MQ,再由MQ传入数据库 (如果需要削峰) 或者 程序异步读取hash传入数据库
        return result;
    }

    async getSecKillInfo(id: string): Promise<SecKillInfo> {
        return Dao.getById(id);
    }
}

/**
 * 数据处理方法(理论上每个不同的算法,储存方案是可能不一样的)
 */
export class Dao {
    static secKillPrefix = "seckill";


    static async getById(id: string): Promise<SecKillInfo> {

        let data = await config.redis.hmget(Dao.getRedisKey(id), "startTime", "endTime", "count", "singleMax", "soldOut");
        return new SecKillInfo(id, data[0] * 1, data[1] * 1, data[2] * 1, data[3] * 1, data[4] * 1,)


    }

    static async init(info: SecKillInfo) {
        return config.redis.multi()
            .del(Dao.getRedisKey(info.id))
            .del(Dao.getRedisSoldOutKey(info.id))
            .hset(Dao.getRedisKey(info.id), "startTime", info.startTime, "endTime", info.endTime, "count", info.count, "singleMax", info.singleMax, "soldOut", 0)
            .exec();
    }


    static async sold(info: SecKillInfo, userId: string, number: number): Promise<Array<number>> {

        let multi = await config.redis.multi()
            .hincrby(Dao.getRedisKey(info.id), "soldOut", number)
            .hincrby(Dao.getRedisSoldOutKey(info.id), userId, number)
            .exec();

        //强制转换为数字
        return multi.map(v => v[1] * 1)
    }

    static async getSoldCountByUser(info: SecKillInfo, userId) {
        return config.redis.hget(Dao.getRedisSoldOutKey(info.id), userId) * 1;
    }

    static getRedisKey(id: string) {
        return `${Dao.secKillPrefix}:${id}`
    }

    static getRedisSoldOutKey(id: string) {
        return `${this.getRedisKey(id)}:soldOut`;
    }

    static removeSecKill(id: string) {
        return config.redis.multi()
            .del(Dao.getRedisKey(id))
            .del(Dao.getRedisSoldOutKey(id))
            .exec();
    }
}
