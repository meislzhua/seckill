import Solution from "./Solution";
import config from "../config";
import Service, {SecKillStatus} from "../Service";
import SecKillInfo from "../SecKillInfo";

const fs = require("fs");
const path = require("path");

export default class S3 extends Solution {
    async init(info) {
        //初始化脚本
        if (!this.id) {
            let command = (await fs.promises.readFile(path.resolve(__dirname, "../../../secKill.lua"))).toString();
            this.id = await config.redis.script("load", command);
            console.log("脚本加载完毕", this.id)
        }
        await Dao.init(info)
    }

    id = null;

    async secKill(userID, secKillId, number) {
        const secKillInfo = await Dao.getById(secKillId), now = Date.now();

        //判断不适宜抢购的情况
        if (now < secKillInfo.startTime || now > secKillInfo.endTime) return SecKillStatus.NotInTime;         //不在情况时间内
        if (number + secKillInfo.soldOut > secKillInfo.count) return SecKillStatus.StockNotSufficient;        //抢购数量不足

        //构建脚本参数,具体需求什么参数,由自己写的lua脚本确定
        const keys = [number, userID];
        const argv = [
            Dao.getRedisKey(secKillId),
            Dao.getRedisSoldOutKey(secKillId),
            SecKillStatus.Success,
            SecKillStatus.StockNotSufficient,
            SecKillStatus.Over,
        ];

        return await config.redis.evalsha(this.id, keys.length, ...keys, ...argv) * 1;
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

    static removeSecKill(id:string){
        return config.redis.multi()
            .del(Dao.getRedisKey(id))
            .del(Dao.getRedisSoldOutKey(id))
            .exec();
    }
}
