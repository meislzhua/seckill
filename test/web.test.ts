import web, {port} from '../src/web';
import test from 'ava';
import axios from 'axios';
import {SecKillStatus} from "../src/Service";

const params = {
    startTime: Date.now(),
    endTime: Date.now() + 60 * 1000,
    count: 77,
    singleMax: 2,
}
let initData = null;

//等待web初始化完毕
test.before(async () => {
    await web;
    const initRequest = await axios.get(`http://localhost:${port}/init`, {params});
    initData = initRequest.data;
});

test("id获取测试", async t => {
    const a = await axios.get(`http://localhost:${port}/id`)
    t.truthy(a?.data?.machineId);
})

test("简略初始信息化测试", async t => {
    const infoRequest = await axios.get(`http://localhost:${port}/`);
    for (let key in params) {
        t.is(infoRequest?.data?.info?.[key], params[key])
    }
})
test("简略秒杀测试", async t => {
    const secKillRequest = await axios.get(`http://localhost:${port}/secKill`);
    t.is(secKillRequest?.data?.result, SecKillStatus.Success)
})