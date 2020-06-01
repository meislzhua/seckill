import Service from "./Service";
import S1 from "./solution/S1";
import S3 from "./solution/S3";
import S2 from "./solution/S2";
import SecKillInfo from "./SecKillInfo";

const express = require('express');
const app = express();
const machineId = Math.random();

let service: Service = new Service(new S1());

app.get('/', async (req, res) => {
    res.jsonp({
        code: 200,
        solution: service.solution["__proto__"].constructor.name,
        info: await service.solution.getSecKillInfo(service.secKillInfo.id)
    });
});
app.get('/init', async (req, res) => {
    let {startTime = Date.now(), endTime = startTime + 20 * 1000, count = 10, singleMax = 1, solution = "s1"} = req.query;
    let sMap = {"s1": S1, "s2": S2, "s3": S3};
    service = new Service(new (sMap[solution] || S1)());
    await service.init(startTime * 1, endTime * 1, count * 1, singleMax * 1);
    res.jsonp({code: 200});
});

app.get('/secKill', async (req, res) => {
    let count = service.getRandomCount();
    let result = await service.secKill(service.getRandomUser(), SecKillInfo.defaultId, count);
    res.jsonp({code: 200, result});
});

app.get('/id', async (req, res) => res.jsonp({code: 200, machineId}));


export const port = process.argv[2] || 8090;
export default (async () => {
    await service.init(Date.now(), Date.now(), 100, 5, SecKillInfo.defaultId);
    console.log("端口:", port);
    app.listen(port);
})();
