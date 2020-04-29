import Solution from "./Solution";
import cache from "../cache";
import Service, {SecKillStatus} from "../Service";

export default class S1 extends Solution {

    async initSecKill(saleId) {}

    async secKill(userId:string, saleId:string, number: number):Promise<SecKillStatus> {
        const saleInfo = await this.service.getSaleInfo(saleId), now = Date.now();

        //判断不适宜抢购的情况
        if (now < saleInfo.startTime || now > saleInfo.endTime) return SecKillStatus.NotInTime;     //不在情况时间内
        if (number + saleInfo.soldOut > saleInfo.count) return SecKillStatus.StockNotSufficient;    //抢购数量不足
        const sold = await this.service.getSold(userId, saleId);    //该用户已经抢购的数量
        if (number + sold > saleInfo.singleMax) return SecKillStatus.Over;                          //超出单人抢购限制

        //执行抢购操作
        const soldOut = await cache.redis.hincrby(Service.getRedisKey(saleId), "soldOut", number) * 1;
        //发生超卖的情况
        if (soldOut > saleInfo.count) {
            await cache.redis.hincrby(Service.getRedisKey(saleId), "soldOut", -number);
            return SecKillStatus.StockNotSufficient;
        }

        //因单人并发导致单人超卖的情况  ps:这部分应该在前置部分所过滤,这里考虑没被过滤的情况
        let nowSold = await this.service.setSold(userId, saleId, number);
        if (nowSold > saleInfo.singleMax) {
            //这里应该使用pipeline
            await cache.redis.hincrby(Service.getRedisKey(saleId), "soldOut", -number);
            await this.service.setSold(userId, saleId, -number);
            return SecKillStatus.Over;
        }

        //todo 把成功结果存入MQ,再由MQ传入数据库 或者程序异步读取hash传入数据库
        return SecKillStatus.Success;
    }

}