import { Company } from "../models/company.model.js";
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