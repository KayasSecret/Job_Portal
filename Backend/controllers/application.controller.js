import { Application } from "../models/application.model.js"
import { Job } from "../models/job.model.js"
import { User } from "../models/user.model.js"

export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;

        if (!jobId) {
            return res.status(404).json({
                message: "Job id not found.",
                success: false
            })
        }

        // Verify the authenticated user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        // Prevent recruiters from applying
        if (user.role === 'recruiter') {
            return res.status(403).json({
                message: "Recruiter accounts cannot apply for jobs.",
                success: false
            });
        }

        // STRICT RESUME CHECK: Candidate must have a valid uploaded resume URL
        const resumeUrl = user.profile?.resume;
        if (!resumeUrl || typeof resumeUrl !== 'string' || resumeUrl.trim() === '') {
            return res.status(400).json({
                message: "Resume required before applying. Please upload your resume to proceed.",
                requireResume: true,
                success: false
            });
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
        if (error.code === 11000) {
            return res.status(400).json({
                message: "You have already applied for the job.",
                success: false
            });
        }
        return res.status(500).json({
            message: "Server error",
            success: false
        });
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
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};

// Recruiter will see all applicants across all jobs they posted
export const getAllRecruiterApplicants = async (req, res) => {
    try {
        const recruiterId = req.id;

        // Find all jobs created by this recruiter
        const recruiterJobs = await Job.find({ created_by: recruiterId })
            .select("_id title company location jobType salary position createdAt")
            .populate("company", "name logo");

        const jobIds = recruiterJobs.map((j) => j._id);

        const applications = await Application.find({ job: { $in: jobIds } })
            .populate({
                path: "applicant",
                select: "fullName email phoneNumber profile createdAt"
            })
            .populate({
                path: "job",
                select: "title location salary jobType company created_by",
                populate: {
                    path: "company",
                    select: "name logo"
                }
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            applications,
            jobs: recruiterJobs,
            success: true
        });
    } catch (error) {
        console.error("GET ALL RECRUITER APPLICANTS ERROR:", error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};

// Admin will see how many users have applied for a specific job.
export const getApplicants = async (req, res) => {
    try {

        const jobId = req.params.id;

        // first find job
        const job = await Job.findById(jobId).populate({
            path: "applications",
            populate: {
                path: "applicant"
            }
        });

        // then check
        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        // Authorize: Only the recruiter who created this job can view its applicants
        if (job.created_by.toString() !== req.id) {
            return res.status(403).json({
                message: "You are not authorized to view applicants for this job.",
                success: false
            });
        }

        return res.status(200).json({
            job,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
}

export const updateStatus = async (req, res) => {
    try {

        const { status } = req.body;
        const applicationId = req.params.id;

        if (!status) {
            return res.status(404).json({
                message: 'Status is required.',
                success: false
            })
        }

        // Find application using application ID
        const application = await Application.findOne({
            _id: applicationId
        }).populate("job");

        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
                success: false
            })
        }

        // Authorize: Only the recruiter who posted the job can update candidate status
        if (!application.job || application.job.created_by.toString() !== req.id) {
            return res.status(403).json({
                message: "You are not authorized to update this application status.",
                success: false
            });
        }

        // Update status
        application.status = status.toLowerCase();

        await application.save();

        return res.status(200).json({
            message: "Status updated successfully.",
            success: true
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
}

// ================= DELETE / REMOVE APPLICANT =================
export const deleteApplication = async (req, res) => {
    try {
        const applicationId = req.params.id;
        const userId = req.id;

        const application = await Application.findById(applicationId).populate("job");

        if (!application) {
            return res.status(404).json({
                message: "Applicant record not found.",
                success: false
            });
        }

        // Authorize: Only the recruiter who created this job can remove this candidate
        if (!application.job || application.job.created_by.toString() !== userId) {
            return res.status(403).json({
                message: "You are not authorized to delete this applicant record.",
                success: false
            });
        }

        // 1. Remove this application from the Job's applications array
        await Job.findByIdAndUpdate(application.job._id, {
            $pull: { applications: application._id }
        });

        // 2. Delete the application record itself
        await Application.findByIdAndDelete(applicationId);

        return res.status(200).json({
            message: "Applicant record removed successfully.",
            success: true,
            deletedApplicationId: applicationId
        });

    } catch (error) {
        console.error("DELETE APPLICATION ERROR:", error);
        return res.status(500).json({
            message: "Server error while deleting applicant record.",
            success: false
        });
    }
};