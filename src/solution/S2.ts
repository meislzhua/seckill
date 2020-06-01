import Solution from "./Solution";
import S1 from "./S1";
import config from "../config";
import Service, {SecKillStatus} from "../Service";
import S3 from "./S3";
import SecKillInfo from "../SecKillInfo";

export default class S2 extends Solution {
    tmp_s: Solution = new S3();
    count = 0;

    async init(info): Promise<any> {

        await Dao.init(info)
        await this.tmp_s.init(info)
    }

    async secKill(userID, secKillId, number: number): Promise<any> {
        const saleCache = await LocalCache.getSaleCache(secKillId), now = Date.now();

        //判断不适宜抢购的情况
        if (now < saleCache.startTime || now > saleCache.endTime) return SecKillStatus.NotInTime;   //不在情况时间内
        if (saleCache.isSellOut) return SecKillStatus.StockNotSufficient;                           //已经售完

        //没错,我就是偷懒了,哈哈哈哈,这里使用了s3的算法
        let res = await this.tmp_s.secKill(userID, secKillId, number);

        //记录一下没有使用缓存的次数
        this.count++;

        //更新缓存
        if (res === SecKillStatus.StockNotSufficient) {
            saleCache.isSellOut = true;
            LocalCache.setSaleCache(saleCache);
        }
        return res;

    }


    getMessage(): String {
        return `子算法: ${this.tmp_s["__proto__"].constructor.name} 没有使用缓存的次数: ${this.count}`;
    }

    async getSecKillInfo(id: string): Promise<SecKillInfo> {
        return Dao.getById(id);
    }
}

class LocalCache {
    //TODO cache的简单实现,并不能投入生产使用; 还涉及缓存更新,缓存清除等逻辑
    private static cache: any = {};

    /**
     * 设置秒杀本地缓存
     * @param cacheInfo 秒杀缓存信息
     */
    static setSaleCache(cacheInfo) {
        cacheInfo && (this.cache[cacheInfo.secKillInfo.id] = cacheInfo);
    }

    /**
     * 获取秒杀本地缓存
     * @param secKillId 秒杀Id
     */
    static async getSaleCache(secKillId) {
        //如果有缓存,则直接返回缓存
        if (this.cache[secKillId]) return this.cache[secKillId];

        //从redis获取秒杀信息
        let secKillInfo = await Dao.getById(secKillId);

        //设置缓存本地缓存并返回
        return this.cache[secKillId] = {
            secKillInfo,
            isSoldOut: false
        };
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

    static removeSecKill(id:string){
        return config.redis.multi()
            .del(Dao.getRedisKey(id))
            .del(Dao.getRedisSoldOutKey(id))
            .exec();
    }
}
