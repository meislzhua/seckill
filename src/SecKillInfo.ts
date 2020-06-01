export default class SecKillInfo {
    static defaultId = "MeIsLZHua"      //这里默认随意默认一个id,不再从其他地方获取ID,方便演示

    id: string;              //id
    startTime: number;      //开始时间(毫秒时间戳)
    endTime: number;        //结束时间(毫秒时间戳)
    count: number;          //秒杀总数
    singleMax: number;      //单人秒杀限额
    soldOut: number;        //已经售出(临时只读,不是最新)

    constructor(id: string, startTime: number, endTime: number, count: number, singleMax: number, soldOut: number = 0) {
        this.id = id;
        this.startTime = startTime;
        this.endTime = endTime;
        this.count = count;
        this.singleMax = singleMax;
        this.soldOut = soldOut;
    }
}