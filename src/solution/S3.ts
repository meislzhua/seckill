import Solution from "./Solution";
import cache from "../cache";
import Service, {SecKillStatus} from "../Service";

const fs = require("fs");
const path = require("path");

export default class S3 extends Solution {
    async initSecKill(saleId) {
        //初始化脚本
        if (!this.id) {
            let command = (await fs.promises.readFile(path.resolve(__dirname, "../../seckill.lua"))).toString();
            this.id = await cache.redis.script("load", command);
            console.log("脚本加载完毕", this.id)
        }
    }

    id = null;

    async secKill(userID, saleId, number) {
        const saleInfo = await this.service.getSaleInfo(saleId), now = Date.now();

        //判断不适宜抢购的情况
        if (now < saleInfo.startTime || now > saleInfo.endTime) return SecKillStatus.NotInTime;         //不在情况时间内
        if (number + saleInfo.soldOut > saleInfo.count) return SecKillStatus.StockNotSufficient;        //抢购数量不足

        //构建脚本参数,具体需求什么参数,由自己写的lua脚本确定
        const keys = [number, userID];
        const argv = [
            Service.getRedisKey(saleId),
            Service.getRedisSoldOutKey(saleId),
            SecKillStatus.Success,
            SecKillStatus.StockNotSufficient,
            SecKillStatus.Over,
        ];

        return await cache.redis.evalsha(this.id, keys.length, ...keys, ...argv)  * 1;
    }

}