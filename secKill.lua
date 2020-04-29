local number = tonumber(KEYS[1]);
local saleInfo = redis.call('hmget',ARGV[1],'singleMax','soldOut','count');
local singleMax = tonumber(saleInfo[1]);
local soldOut = tonumber(saleInfo[2]);
local count = tonumber(saleInfo[3]);

if (count - soldOut < number) then return ARGV[4] end;

local userSoldOut = tonumber(redis.call('hget',ARGV[2],KEYS[2]) or 0);
if (userSoldOut + number > singleMax) then return ARGV[5] end;


redis.call('hincrby',ARGV[1],'soldOut',number);
redis.call('hincrby',ARGV[2],KEYS[2],number);
return ARGV[3]

-- KEYS[1] = number
-- KEYS[2] = userId

-- ARGV[1] = sale redis key
-- ARGV[2] = user soldOut key

-- ARGV[3] = success
-- ARGV[4] = ERROR StockNotSufficient
-- ARGV[5] = ERROR Over

