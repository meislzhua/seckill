import Service from "./Service";
import S1 from "./solution/S1";
import cache from "./cache";
import S2 from "./solution/S2";
import S3 from "./solution/S3";

(async () => {
    let tmp, tmpList = [], res = {}, now;
    let s1 = new Service(new S1());
    await s1.init(Date.now(), Date.now() + 1000, 10);

    tmp = 10000, tmpList = [];
    console.log("共个数", s1.count, "循环次数", tmp);
    console.time("共耗时"), console.time("循环结束耗时");
    while (tmp--) {
        tmpList.push(s1.getSale())
    }
    console.timeEnd(`循环结束耗时`);

    tmp = await Promise.all(tmpList);
    console.timeEnd("共耗时");
    tmp.forEach(v => res[v] = (res[v] ? res[v] + 1 : 1));
    console.log("成功数", res[Service.secKillStatus.Success], "失败数", res[Service.secKillStatus.Fail], "不在时间范围", res[Service.secKillStatus.NotInTime] || 0);
})();

// cache.redis.quit();