import { Company } from "../models/company.model.js";

// ✅ Register Company
export const registerCompany = async (req, res) => {
  try {
    const { name } = req.body;   // ✅ use "name"

    if (!name) {
      return res.status(400).json({
        message: "Company name is required.",
        success: false
      });
    }

    // ✅ correct duplicate check
    let company = await Company.findOne({ name });

    if (company) {
      return res.status(400).json({
        message: "Company already exists",
        success: false
      });
    }

    // ✅ correct field
    company = await Company.create({
      name,
      userId: req.id
    });

    return res.status(201).json({
      message: "Company registered successfully",
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

    const updateData = { name, description, website, location };

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!company) {
      return res.status(404).json({
        message: "Company not found.",
        success: false
      });
    }

    return res.status(200).json({
      message: "Company information updated.",
      company,
      success: true
    });

  } 
  }
};  