import reportModel from '../models/reportModel.js';
import { decryptText, encryptText } from '../utils/encryptText.js';
import summarizeMedicalReport from '../utils/generateSummary.js';
import sendResponse from '../utils/sendResponse.js'
import extractText from '../utils/textExtracter.js';
import { removeFileFromCloudinary, uploadFileToCloudinary } from '../utils/uploadToCloudinary.js'
import fs from 'fs-extra'

const addReport = async (req, res) => {
    try {

        const filePath = req.file?.path;

        const { id } = req.user

        const reportData = {
            ...req.body,
            user_id: id,
            file_urls: {}
        };

        if (filePath) {

            // For extracting text from pdf
            const { error: extractedTextError, text } = await extractText(filePath);

            if (extractedTextError) {
                return sendResponse(res, 400, extractedTextError)
            }

            reportData.extracted_text = encryptText(text);
            // For extracting text from pdf

            // For pdf urls
            const publicFileUrls = await uploadFileToCloudinary(filePath);

            if (!publicFileUrls) {
                return sendResponse(res, 500, "Cloudinary Error");
            }

            reportData.file_urls = {
                url: publicFileUrls.secure_url,
                public_id: publicFileUrls.public_id,
                local_path: filePath
            }
            // For pdf urls

            // For AI response

            const { summary, error: aiError } = await summarizeMedicalReport(text);

            if (aiError) {
                reportData.error = encryptText(aiError);
                reportData.is_summarized = false;
                return;
            }

            reportData.summary = encryptText(summary);

            reportData.is_summarized = true;
            // For AI response
        }

        await reportModel.create({ ...reportData });

        sendResponse(res, 200, "Medical report uploaded successfully", { summary: decryptText(reportData.summary), error: decryptText(reportData.error), is_summarized: reportData.is_summarized, report_title: req.body.report_title, report_description: req.body.report_description })
    } catch (error) {
        console.log("Add Report Error", error);
        sendResponse(res, 500, "Internal server error", { error: error.message })
    }
}

const deleteReport = async (req, res) => {
    try {

        const { id: report_id } = req.params;

        const report = await reportModel.findById(report_id);

        if (!report) {
            return sendResponse(res, 404, "Report not found");
        }

        if (report?.file_urls?.public_id) {
            await removeFileFromCloudinary(report?.file_urls?.public_id, report?.file_urls?.local_path);
        }

        await reportModel.findByIdAndDelete(report_id);

        sendResponse(res, 200, "Report deleted successfully")
    } catch (error) {
        console.log("Error while deleting report", error);
        sendResponse(res, 500, "Internal server error", { error: error.message })
    }
}

const updateReport = async (req, res) => {
    try {

        const { id: report_id } = req.params;

        const filePath = req.file?.path;

        const today = new Date();

        const exitingReport = await reportModel.findById(report_id);

        if (!exitingReport) {
            return sendResponse(res, 404, "Report not found")
        }

        const updatedReportData = { ...req.body, is_updated_today: exitingReport.is_updated_today };

        const isSameDay =
            exitingReport.updatedAt.toDateString() === today.toDateString();

        if (!isSameDay) {
            updatedReportData.is_updated_today = false;
        }

        if (updatedReportData.is_updated_today && filePath) {
            fs.removeSync(filePath);
            return sendResponse(
                res,
                429,
                "You can update this report file only once per day"
            );
        }


        if (filePath) {

            // For extracting text from pdf
            const { error: extractedTextError, text } = await extractText(filePath);

            if (extractedTextError) {
                return sendResponse(res, 400, extractedTextError)
            }

            updatedReportData.extracted_text = encryptText(text);
            // For extracting text from pdf

            if (!reportModel?.file_urls?.public_id) {
                await removeFileFromCloudinary(reportModel?.file_urls?.public_id);
            }

            // For pdf urls
            const publicFileUrls = await uploadFileToCloudinary(filePath);

            if (!publicFileUrls) {
                return sendResponse(res, 500, "Cloudinary Error");
            }

            updatedReportData.file_urls = {
                url: publicFileUrls.secure_url,
                public_id: publicFileUrls.public_id,
            }
            // For pdf urls

            // For AI response

            const { summary, error: aiError } = await summarizeMedicalReport(text);

            if (aiError) {
                updatedReportData.error = encryptText(aiError);
                updatedReportData.is_summarized = false;
                return;
            }

            updatedReportData.summary = encryptText(summary);

            updatedReportData.is_summarized = true;

            updatedReportData.is_updated_today = true;
            // For AI response

        }

        const updatedReport = await reportModel.findByIdAndUpdate(report_id, { $set: updatedReportData }, { new: true });

        if (filePath) {
            return sendResponse(res, 200, "Report updated successfully", { summary: decryptText(updatedReport.summary), error: decryptText(updatedReport.error), is_summarized: updatedReport.is_summarized, report_title: updatedReport.report_title, report_description: updatedReport.report_description })
        }

        sendResponse(res, 200, "Report updated successfully")
    } catch (error) {
        console.log("Update Report Error:", error);
        sendResponse(res, 500, "Internal server error", { error: error.message });
    }
};

const getAllReports = async (req, res) => {
    try {

        const { id } = req.user;

        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const skip = (page - 1) * limit;

        const sortOption = req.query?.sort?.includes("oldest") ? 1 : -1;

        const totalReports = await reportModel.countDocuments({ user_id: id });

        // Fetch paginated reports
        const allReports = await reportModel
            .find({ user_id: id })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: (sortOption) });

        if (!allReports || allReports.length === 0) {
            return sendResponse(res, 200, "No reports found", { reports: [] });
        }

        // Count total documents for pagination metadata
        const totalPages = Math.ceil(totalReports / limit);

        const reports = allReports.map((v) => ({
            summary: decryptText(v.summary),
            error: decryptText(v.error),
            report_title: v.report_title,
            report_type: v.report_type,
            report_description: v.report_description,
            is_summarized: v.is_summarized,
            file_urls: v.file_urls,
            id: v._id
        }));

        sendResponse(res, 200, "Reports successfully retrieved", {
            reports,
            pagination: {
                currentPage: page,
                totalPages,
                totalReports: allReports.length,
                limit,
            },
        });
    } catch (error) {
        console.error("Error while getting all reports", error);
        sendResponse(res, 500, "Internal server error", { error: error.message });
    }
};

const getSingleReport = async (req, res) => {
    try {

        const { id: report_id } = req.params;

        const singleReport = await reportModel.findById({ _id: report_id });

        if (!singleReport) {
            return sendResponse(res, 404, "Report not found")
        }

        const report = { summary: decryptText(singleReport.summary), error: decryptText(singleReport.error), report_title: singleReport.report_title, report_type: singleReport.report_type, report_description: singleReport.report_description, is_summarized: singleReport.is_summarized, file_urls: singleReport.file_urls };

        sendResponse(res, 200, "Report successfully GET", { report })
    } catch (error) {
        console.log("Error while getting single report", error);
        sendResponse(res, 500, "Internal server error", { error: error.message })
    }
}

export { addReport, deleteReport, getAllReports, getSingleReport, updateReport }