import test from 'ava';
import config from "../src/config";


test('redis 连接测试', async t => {
    t.true(await  config.redis.ping() === "PONG")
});