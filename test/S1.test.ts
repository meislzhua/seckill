import test from 'ava';
import S1, {Dao as S1Dao} from "../src/solution/S1";
import SecKillInfo from "../src/SecKillInfo";
import {SecKillStatus} from "../src/Service";

let _secKillId = 1, _userId = 1;
let getSecKillId = () => `s1-${_secKillId++}`;
let getUserId = () => `s1-user-${_userId++}`;

// @ts-ignore
test.beforeEach(t => t.context["id"] = getSecKillId());
test.afterEach(t => S1Dao.removeSecKill(t.context["id"]))

test('s1 - 初始化测试', async t => {
    const startTime = Date.now(), endTime = Date.now() + Math.random() * 2000 | 0, count = 88, singleMax = 6;
    const secKillId = t.context["id"];

    let s1 = new S1();
    let localInfo = new SecKillInfo(secKillId, startTime, endTime, count, singleMax);
    await s1.init(localInfo);

    let info = await s1.getSecKillInfo(secKillId);
    t.is(info.id, secKillId);
    t.is(info.startTime, startTime);
    t.is(info.endTime, endTime);
    t.is(info.count, count);
    t.is(info.singleMax, singleMax);

});

test('s1 - 超时测试 - 没到开始时间', async t => {
    const startTime = Date.now() + 9000, endTime = Date.now() + 20000, count = 88, singleMax = 6;
    const secKillId = t.context["id"];


    const userId = getUserId();

    let s1 = new S1();
    let localInfo = new SecKillInfo(secKillId, startTime, endTime, count, singleMax);
    await s1.init(localInfo);

    t.is(await s1.secKill(userId, secKillId, 1), SecKillStatus.NotInTime);

});

test('s1 - 超时测试 - 超过结束时间', async t => {
    const startTime = Date.now() - 2000, endTime = Date.now() - 1000, count = 88, singleMax = 6;
    const secKillId = t.context["id"];

    const userId = getUserId();

    let s1 = new S1();
    let localInfo = new SecKillInfo(secKillId, startTime, endTime, count, singleMax);
    await s1.init(localInfo);

    t.is(await s1.secKill(userId, secKillId, 1), SecKillStatus.NotInTime);
});

test('s1 - 总数量超出测试', async t => {
    const startTime = Date.now(), endTime = Date.now() + 20000, count = 2, singleMax = 1;
    const secKillId = t.context["id"];

    const userId = getUserId();

    let s1 = new S1();
    let localInfo = new SecKillInfo(secKillId, startTime, endTime, count, singleMax);
    await s1.init(localInfo);

    let i = 2;
    while (i--) {
        t.is(await s1.secKill(getUserId(), secKillId, 1), SecKillStatus.Success);
    }

    t.is(await s1.secKill(userId, secKillId, 1), SecKillStatus.StockNotSufficient)
});

test('s1 - 单人数量超出测试', async t => {
    const startTime = Date.now(), endTime = Date.now() + 20000, count = 3, singleMax = 1;
    const secKillId = t.context["id"];

    const userId = getUserId();

    let s1 = new S1();
    let localInfo = new SecKillInfo(secKillId, startTime, endTime, count, singleMax);
    await s1.init(localInfo);

    t.is(await s1.secKill(userId, secKillId, 2), SecKillStatus.Over);
    t.is(await s1.secKill(userId, secKillId, 1), SecKillStatus.Success);
    t.is(await s1.secKill(userId, secKillId, 1), SecKillStatus.Over);
});

test('s1 - 正常出售(多人多次)测试', async t => {
    const startTime = Date.now(), endTime = Date.now() + 20000, count = 100, singleMax = 10;
    const secKillId = t.context["id"];

    const userId = getUserId();
    const userId2 = getUserId();

    let s1 = new S1();
    let localInfo = new SecKillInfo(secKillId, startTime, endTime, count, singleMax);
    await s1.init(localInfo);

    t.is(await s1.secKill(userId, secKillId, 1), SecKillStatus.Success);
    t.is(await s1.secKill(userId, secKillId, 2), SecKillStatus.Success);
    t.is(await s1.secKill(userId2, secKillId, 1), SecKillStatus.Success);
    t.is(await s1.secKill(userId2, secKillId, 1), SecKillStatus.Success);
    t.is(await s1.secKill(userId2, secKillId, 1), SecKillStatus.Success);
});



