import Solution from "./Solution";
import S1 from "./S1";
import cache from "../cache";
import Service, {SecKillStatus} from "../Service";
import S3 from "./S3";

export default class S2 extends Solution {
    tmp_s: Solution = new S3();
    count = 0;

    setService(service) {
        super.setService(service);
        this.tmp_s.setService(service);
    }

    async initSecKill(saleId): Promise<any> {
        return this.tmp_s.initSecKill(saleId);
    }

    async secKill(userID, saleId, number: number): Promise<any> {
        const saleCache = await cache.getSaleCache(saleId), now = Date.now();

        //判断不适宜抢购的情况
        if (now < saleCache.startTime || now > saleCache.endTime) return SecKillStatus.NotInTime;   //不在情况时间内
        if (saleCache.isSellOut) return SecKillStatus.StockNotSufficient;                            //已经售完

        //没错,我就是偷懒了,哈哈哈哈,这里使用了s3的算法
        let res = await this.tmp_s.secKill(userID, saleId, number);

        //记录一下没有使用缓存的次数
        this.count++;

        //更新缓存
        if (res === SecKillStatus.StockNotSufficient) {
            saleCache.isSellOut = true;
            cache.setSaleCache(saleCache);
        }
        return res;

    }


    getMessage(): String {
        return `没有使用缓存的次数: ${this.count}`;
    }

}
