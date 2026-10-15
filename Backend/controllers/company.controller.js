import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { User } from "../models/user.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

// ✅ Register Company (Supports single-step registration with name, description, website, location, and logo)
export const registerCompany = async (req, res) => {
  try {
    const { name, description, website, location } = req.body;
    const file = req.file;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Company name is required.",
        success: false
      });
    }

    // Duplicate check by name
    let company = await Company.findOne({ name: name.trim() });

    if (company) {
      return res.status(400).json({
        message: "A company with this name already exists.",
        success: false
      });
    }

    const companyData = {
      name: name.trim(),
      description: description?.trim() || "",
      website: website?.trim() || "",
      location: location?.trim() || "",
      userId: req.id
    };

    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      if (cloudResponse && cloudResponse.secure_url) {
        companyData.logo = cloudResponse.secure_url;
      }
    }

    company = await Company.create(companyData);

    return res.status(201).json({
      message: "Company registered successfully",
      company,
      success: true
    });

  } catch (error) {
    console.error("REGISTER COMPANY ERROR:", error);
    res.status(500).json({
      message: "Server error",
      success: false
    });
  }
};

// ✅ Get all companies of logged-in user
export const getCompany = async (req, res) => {
  try {
    const userId = req.id;

    const companies = await Company.find({ userId });

    if(!companies) {
        return res.status(404).json({
           message: "Companies not found",
           success: false
        });
    }

    return res.status(200).json({
        companies,
        success: true
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
      success: false
    });
  }
};

// ✅ Get company by ID
export const getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.id;

    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({
        message: "Company not found.",
        success: false
      });
    }

    return res.status(200).json({
      company,
      success: true
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
      success: false
    });
  }
};

// ✅ Update Company
export const updateCompany = async (req, res) => {
  try {
    const { name, description, website, location } = req.body;
    const file = req.file;
    const updateData = { name, description, website, location };

    const existingCompany = await Company.findById(req.params.id);

    if (!existingCompany) {
      return res.status(404).json({
        message: "Company not found.",
        success: false
      });
    }

    if (existingCompany.userId.toString() !== req.id) {
      return res.status(403).json({
        message: "You are not authorized to update this company.",
        success: false
      });
    }

    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      if (cloudResponse) {
        updateData.logo = cloudResponse.secure_url;
      }
    }

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    return res.status(200).json({
      message: "Company information updated.",
      company,
      success: true
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
      success: false
    });
  }
};

// ✅ Delete Company (with recruiter verification & cascade cleanup of jobs, applications, and savedJobs)
export const deleteCompany = async (req, res) => {
  try {
    const companyId = req.params.id;
    const userId = req.id;

    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({
        message: "Company not found.",
        success: false
      });
    }

    // Verify ownership: Only the recruiter who created this company can delete it
    if (company.userId.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to delete this company.",
        success: false
      });
    }

    // 1. Identify all jobs linked to this company
    const jobs = await Job.find({ company: companyId }).select("_id");
    const jobIds = jobs.map((j) => j._id);

    // 2. Cascade delete all candidate applications linked to these jobs
    if (jobIds.length > 0) {
      await Application.deleteMany({ job: { $in: jobIds } });

      // 3. Remove these jobs from students' savedJobs lists
      await User.updateMany(
        { savedJobs: { $in: jobIds } },
        { $pull: { savedJobs: { $in: jobIds } } }
      );

      // 4. Delete the associated jobs
      await Job.deleteMany({ company: companyId });
    }

    // 5. Remove company reference from any user profile
    await User.updateMany(
      { "profile.company": companyId },
      { $unset: { "profile.company": "" } }
    );

    // 6. Delete the company document itself
    await Company.findByIdAndDelete(companyId);

    return res.status(200).json({
      message: "Company and all associated jobs/applications deleted successfully.",
      success: true,
      deletedCompanyId: companyId,
      deletedJobsCount: jobIds.length
    });

  } catch (error) {
    console.error("DELETE COMPANY ERROR:", error);
    return res.status(500).json({
      message: "Server error while deleting company.",
      success: false
    });
  }
};