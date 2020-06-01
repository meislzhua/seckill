import Solution from "./solution/Solution";
import SecKillInfo from "./SecKillInfo";

//秒杀请求返回类型
export enum SecKillStatus {
    Success = 1,                //成功
    Fail = 2,                   //失败
    NotInTime = 3,              //不在秒杀范围内
    StockNotSufficient = 4,     //库存不足
    Over = 5,                   //超出抢购限制
}


export default class Service {
    solution: Solution = null;      //选择的算法

    secKillInfo: SecKillInfo = null;           //测试用属性: 缓存秒杀信息
    userList = [];                  //测试用属性: 随即生成的用户id列表

    //构建对应服务时,必须加入对应的算法
    constructor(solution: Solution) {
        this.solution = solution;
    }

    //初始化
    async init(startTime = Date.now()-1, endTime = Date.now()+5000, count = 10, singleMax = 1, secKillId = SecKillInfo.defaultId) {
        const randomUserCoefficient = 5;        //生成随即用户系数 (倍)[count的X倍]

        //生成随即用户
        this.userList = new Array(count * randomUserCoefficient).fill(1).map(v => Math.random());

        //生成新的秒杀
        this.secKillInfo = new SecKillInfo(secKillId, startTime, endTime, count, singleMax);

        //具体算法部分初始化
        await this.solution.init(this.secKillInfo);
    }

    async secKill( userId: string, secKillId: string,number: number) {
        //执行执行具体算法
        return await this.solution.secKill(userId, secKillId, number);
    }

    /**
     * 测试用方法: 获取一个随机用户
     */
    getRandomUser() {
        return this.userList[this.userList.length * Math.random() | 0];
    }

    /**
     * 测试用方法: 随机获取一个1至singleMax的数字
     */
    getRandomCount(): number {
        return (this.secKillInfo.singleMax + 1) * Math.random() | 0 || 1;
    }
}