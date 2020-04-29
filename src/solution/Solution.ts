import Service, {SecKillStatus} from "../Service";

export default abstract class Solution {
    service: Service;

    abstract async secKill(userId: string, saleId: string, number: number): Promise<SecKillStatus>;

    abstract async initSecKill(saleId: string);

    setService(service: Service) {
        this.service = service;
    }

    getMessage(): String {
        return null;
    }
}

