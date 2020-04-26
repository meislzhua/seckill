import Service from "../Service";

export default abstract class Solution {
    service: Service;

    abstract async secKill(userID, saleId);

    abstract async initSecKill(count, saleId);

}

