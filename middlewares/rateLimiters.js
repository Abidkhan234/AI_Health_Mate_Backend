import userUsageModel from "../models/userUsageModel.js";
import sendResponse from "../utils/sendResponse.js";

const checkDailyLimit = async (req, res, next) => {
    try {
        const { id } = req.user; // You must have user auth middleware before this

        let usage = await userUsageModel.findOne({ user_id: id });

        const today = new Date();
        const isSameDay =
            usage && usage.last_request_date.toDateString() === today.toDateString();

        if (!usage) {
            // If no usage than create one
            usage = await userUsageModel.create({
                user_id: id,
                requests_today: 1,
                last_request_date: today
            });
            // If no usage than create one
        }
        else if (isSameDay && usage.requests_today == 3) {
            // if same day and request exceeds 3
            return sendResponse(res, 429, "Daily limit reached (3 reports per day)")
            // if same day and request exceeds 3
        }
        else {
            if (!isSameDay) {
                // if sameDay false than reset
                usage.requests_today = 1;
                usage.last_request_date = today;
                // if sameDay false than reset
            } else {
                // if sameDay and requests left than increase by one
                usage.requests_today += 1;
                // if sameDay and requests left than increase by one
            }
            await usage.save();
        }

        req.usage = usage;

        next();
    } catch (error) {
        console.log("Error in check rate limiter", error);

        sendResponse(res, 500, "Rate limit check failed", { error: error.message })
    }
};

export { checkDailyLimit }