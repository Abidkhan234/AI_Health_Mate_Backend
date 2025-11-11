import mongoose from 'mongoose'

const fileSchema = new mongoose.Schema({
    url: { type: String, default: "" },           // Cloudinary secure URL
    public_id: { type: String, default: "" },
}, { _id: false })

const reportSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        select: false
    },
    report_title: {
        type: String,
        required: true
    },
    report_description: {
        type: String,
        default: null
    },
    report_type: {
        type: String,
        required: true,
        enum: ["lab_report", "discharge_summary", "diagnostic_report"]
    },
    summary: {
        type: String,
        default: "",
    },
    error: {
        type: String,
        default: null
    },
    extracted_text: {
        type: String,
        maxlength: 50000,
        default: ""
    },
    file_urls: fileSchema,
    is_summarized: {
        type: Boolean,
        default: false,
    },
    is_updated_today: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ reportType: 1 });

const reportModel = mongoose.model("Report", reportSchema);

export default reportModel