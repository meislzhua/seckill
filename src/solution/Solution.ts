import Service, {SecKillStatus} from "../Service";
import SecKillInfo from "../SecKillInfo";

export default abstract class Solution {
    service: Service;

    /**
     * 秒杀接口
     * @param userId
     * @param secKillId
     * @param number
     */
    abstract async secKill(userId: string, secKillId: string, number: number): Promise<SecKillStatus>;

    /**
     * 算法初始化
     * @param info 秒杀信息
     */
    abstract async init(info: SecKillInfo);



    /**
     * 测试用方法: 额外log消息接口,如果有需要显示额外的log消息,可以在本接口返回
     */
    getMessage(): String {
        return null;
    }

    /**
     * 测试用方法: 根据id获取已经秒杀信息
     */
    abstract async getSecKillInfo(id: string): Promise<SecKillInfo>;

}

