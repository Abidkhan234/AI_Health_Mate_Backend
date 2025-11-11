import mongoose from "mongoose";

const userUsageSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    requests_today: { type: Number, default: 0 },
    last_request_date: { type: Date, default: Date.now }
});

const userUsageModel = mongoose.model("UserUsage", userUsageSchema);

export default userUsageModel;