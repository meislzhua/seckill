import test from 'ava';
import Service, {SecKillStatus} from "../src/Service";
import S3 from "../src/solution/S3";
import S1, {Dao as S1Dao} from "../src/solution/S1";
import SecKillInfo from "../src/SecKillInfo";

let _secKillId = 1, _userId = 1;
let getSecKillId = () => `s1-${_secKillId++}`;
let getUserId = () => `s1-user-${_userId++}`;

// @ts-ignore
test.beforeEach(t => t.context["id"] = getSecKillId());
test.afterEach(t => S1Dao.removeSecKill(t.context["id"]))


test('service 初始化测试(依赖s1)', async t => {
    const startTime = Date.now(), endTime = Date.now()+Math.random()*2000 | 0, count = 88, singleMax = 6;
    const secKillId = t.context["id"];
    const service = new Service(new S1());
    await service.init(startTime, endTime, count, singleMax, secKillId);

    let info = await service.solution.getSecKillInfo(secKillId);
    t.is(info.id, secKillId);
    t.is(info.startTime, startTime);
    t.is(info.endTime, endTime);
    t.is(info.count, count);
    t.is(info.singleMax, singleMax);

});
test('service 秒杀测试', async t => {
    const startTime = Date.now(), endTime = Date.now() + 20000, count = 88, singleMax = 6;
    const secKillId = t.context["id"];
    const service = new Service(new S1());
    await service.init(startTime, endTime, count, singleMax, secKillId);

    const userId = getUserId();
    const userId2 = getUserId();



    t.is(await service.secKill(userId, secKillId, 1), SecKillStatus.Success);
    t.is(await service.secKill(userId, secKillId, 2), SecKillStatus.Success);
    t.is(await service.secKill(userId2, secKillId, 1), SecKillStatus.Success);
    t.is(await service.secKill(userId2, secKillId, 1), SecKillStatus.Success);
    t.is(await service.secKill(userId2, secKillId, 1), SecKillStatus.Success);

});