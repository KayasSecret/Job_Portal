import { application } from "express";
import { Application } from "../models/application.model.js"
import { Job } from "../models/job.model.js"

export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const { id: jobId } = req.params.id;

        if (!jobId) {
            return res.status(404).json({
                message: "Job id not found.",
                success: false
            })
        }

        // Check whether the user has already applied for this job or not.
        const existingApplication = await Application.findOne({ job: jobId, applicant: userId })

        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for the job.",
                success: false
            })
        }

        // Check whether the job exists or not.
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            })
        }

        // For creating a new application
        const newApplication = await Application.create({
            job: jobId,
            applicant: userId
        })

        job.applications.push(newApplication._id);
        await job.save();
        return res.status(201).json({
            message: "Job applied successfully.",
            success: true
        })
    }
    catch (error) {
        console.log(error);
    }
}

export const getAppliedJobs = async (req, res) => {
    try {
        const userId = req.id;
        const application = await Application.find({ applicant: userId }).sort({ createdAt: -1 }).populate({
            path: 'job',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'company',
                options: { sort: { createdAt: -1 } }
            }
        });

        if (!application) {
            return res.status(404).json({
                message: "No Applications.",
                success: true
            })
        }

        return res.status(200).json({
            application,
            success: true
        })
    }
    catch (error) {
        console.log(error);
    }
}

// Admin will see how many users have applied.
export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await job.findById(jobId).populate({
            path: 'applications',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'applicant'
            }
        });

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            })
        }

        return res.status(200).json({
            job,
            success: true
        })
    }
    catch (error) {
        console.log(error);
    }
}

export const updateStatus = async (req, res) => {
    try {
        const status = req.body;
        const applicationId = req.params.id;

        if (!status) {
            return res.status(404).json({
                message: 'Status is required.',
                success: false
            })
        }

        // Find the application using the application's ID.
        const application = await Application.findOne({ _id: applicationId });

        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
                success: false
            })
        }

        // To update the status
        application.status = status.toLowerCase();
        await application.save();

        return res.status(200).json({
            message: "Status updated successfully.",
            success: true
        })
    }
    catch (error) {
        console.log(error);
    }
}