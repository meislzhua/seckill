import Service from "./Service";
import S1 from "./solution/S1";
import S3 from "./solution/S3";
import S2 from "./solution/S2";

var express = require('express');
var app = express();

let service: Service = new Service(new S1());

let id = Math.random();

app.get('/init', async (req, res) => {
    let {startTime = Date.now() + 10 * 1000, endTime = startTime + 20 * 1000, count = 10, solution = "s1"} = req.query;
    let sMap = {"s1": S1, "s2": S2, "s3": S3};
    service = new Service(new (sMap[solution] || S1)());
    await service.init(startTime, endTime, count);
    console.log("初始化完成", solution);
    res.send({code: 200});
});

app.get('/getSale', async (req, res) => {
    let result = await service.getSale(service.getRandomCount(), service.getRandomUser());
    res.send({code: 200, result});
});

app.get('/id', async (req, res) => res.send({code: 200, id}));

console.log("端口:", process.argv[2] || 8090);
app.listen(process.argv[2] || 8090);