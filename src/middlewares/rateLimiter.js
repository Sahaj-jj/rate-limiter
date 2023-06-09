import { RateLimiter } from "../rateLimiter.js";
import redisClient from "../redis.js";

const rateLimiterMiddleware = async (req, res, next) => {
    const key = req.ip;
    try {
        RateLimiter.initialize({
            redisClient,
        });
        const limiterParams = await redisClient.hgetall(`limiterParams:${key}`);

        let isAllowed = await RateLimiter.isAllowed({
            key: req.ip,
            ...limiterParams,
        });

        if (isAllowed) {
            return next();
        } else {
            return res.status(429).send("Too Many Requests");
        }
    } catch (error) {
        console.error(`Error in rate limiter middleware: ${error}`);
        return res.status(500).send("Internal Server Error");
    }
};

export default rateLimiterMiddleware;
