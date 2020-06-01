import Service, {SecKillStatus} from "./Service";
import S1 from "./solution/S1";
import config from "./config";
import S3 from "./solution/S3";
import S2 from "./solution/S2";
import SecKillInfo from "./SecKillInfo";

(async () => {
    const tmp = 40000;                  //模拟并发的次数
    const secKillDelayTime = 5000;      //秒杀持续时间
    const count = 100;                  //总秒杀量
    const singleMax = 1;                //单用户最多秒杀数
    const requestTime = 500;            //测试并发请求均匀在[requestTime]时间内 (如果不均匀分布,将可能连续执行)
    let tmpList = [];                   //用于储存模拟并发的请求

    //选择需要的算法并初始化
    const service = new Service(new S3());
    await service.init(Date.now(), Date.now() + secKillDelayTime, count, singleMax);

    console.log("算法", service.solution["__proto__"].constructor.name);
    console.log("共个数", service.secKillInfo.count, "每人最多抢购数", service.secKillInfo.singleMax, "循环次数", tmp);
    console.time("共耗时"), console.time("循环结束耗时");

    //将请求平均分布在一秒内,避免node.js顺序执行的情况
    let loop = Promise.all(new Array(tmp).fill(0).map(value => new Promise(res => {
        setTimeout(() => {
            tmpList.push(service.secKill( service.getRandomUser(),SecKillInfo.defaultId,service.getRandomCount()));
            res()
        }, Math.random() * requestTime | 0)
    })));

    console.timeEnd(`循环结束耗时`);

    //统计请求得出的结果
    await loop;
    tmpList = await Promise.all(tmpList);
    console.timeEnd("共耗时");
    let res = tmpList.reduce((p, v) => (p[v] = (p[v] || 0) + 1, p), {});

    console.log("共售出", (await service.solution.getSecKillInfo(service.secKillInfo.id)).soldOut)
    console.log("请求分布",
        Object.keys(SecKillStatus)
            .filter(v => res[SecKillStatus[v]])
            .map(v => `[${v} : ${res[SecKillStatus[v]]}] `)
            .join(" ")
    );

    //展示额外信息
    let extra = service.solution.getMessage();
    extra && console.log("额外信息", extra)

    config.redis.disconnect();
})();