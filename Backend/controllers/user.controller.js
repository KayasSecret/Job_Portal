import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Job } from "../models/job.model.js";


// ================= REGISTER =================
export const register = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, password, role } = req.body;

        if (!fullName || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        }

        const file = req.file;
        let cloudResponse = null;
        if (file) {
            const fileUri = getDataUri(file);
            cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists with this email",
                success: false
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            fullName,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto: cloudResponse ? cloudResponse.secure_url : ""
            }
        });

        return res.status(201).json({
            message: "Account created successfully",
            success: true
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};


// ================= LOGIN =================
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        }

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
                success: false
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password",
                success: false
            });
        }

        if (role !== user.role) {
            return res.status(400).json({
                message: "Role mismatch",
                success: false
            });
        }

        // JWT Token
        const token = jwt.sign(
            { userId: user._id },
            process.env.SECRET_KEY,
            { expiresIn: "1d" }
        );

        // Safe user object (no password)
        const safeUser = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        };

        return res
            .status(200)
            .cookie("token", token, {
                maxAge: 1 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production"
            })
            .json({
                message: `Welcome back ${user.fullName}`,
                user: safeUser,
                success: true
            });

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};


// ================= LOGOUT =================
export const logout = async (req, res) => {
    try {
        return res
            .status(200)
            .cookie("token", "", {
                maxAge: 0,
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production"
            })
            .json({
                message: "Logged out successfully",
                success: true
            });
    } catch (error) {
        console.error("LOGOUT ERROR:", error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};

// ================= GET USER PROFILE =================
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.error("GET PROFILE ERROR:", error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};

// ================= UPDATE PROFILE =================
export const updateProfile = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, bio, skills } = req.body;
        const userId = req.id;

        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        // If recruiter, restrict updates strictly to permitted fields (name, email, phone, bio)
        if (user.role === "recruiter") {
            if (fullName) user.fullName = fullName.trim();
            if (email) user.email = email.trim();
            if (phoneNumber !== undefined) user.phoneNumber = phoneNumber.trim();
            if (!user.profile) user.profile = {};
            if (bio !== undefined) user.profile.bio = bio.trim();
        } else {
            // Student update logic
            let skillsArray;
            if (skills) {
                skillsArray = typeof skills === "string" ? skills.split(",").map(skill => skill.trim()).filter(Boolean) : skills;
            }

            // Update basic fields
            if (fullName) user.fullName = fullName;
            if (email) user.email = email;
            if (phoneNumber) user.phoneNumber = phoneNumber;

            // Ensure profile exists
            if (!user.profile) {
                user.profile = {};
            }

            if (bio) user.profile.bio = bio;
            if (skills) user.profile.skills = skillsArray;

            // Resume Upload
            const file = req.file;

            if (file) {
                const fileURI = getDataUri(file);
                const cloudResponse = await cloudinary.uploader.upload(
                    fileURI.content,
                    {
                        resource_type: "raw"
                    }
                );

                if (cloudResponse) {
                    user.profile.resume = cloudResponse.secure_url;
                    user.profile.resumeOriginalName = file.originalname;
                }
            }
        }

        await user.save();

        const updatedUser = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        };

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
            success: true
        });

    } catch (error) {
        console.error("UPDATE PROFILE ERROR:", error);

        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};

// ================= UPDATE PROFILE PHOTO =================
export const updateProfilePhoto = async (req, res) => {
    try {
        const userId = req.id;
        const { removePhoto } = req.body;
        const file = req.file;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        if (!user.profile) {
            user.profile = {};
        }

        if (removePhoto === "true" || removePhoto === true) {
            user.profile.profilePhoto = "";
            await user.save();

            const updatedUser = {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                profile: user.profile
            };

            return res.status(200).json({
                message: "Profile photo removed successfully",
                user: updatedUser,
                success: true
            });
        }

        if (!file) {
            return res.status(400).json({
                message: "Please select an image file to upload",
                success: false
            });
        }

        const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedImageTypes.includes(file.mimetype)) {
            return res.status(400).json({
                message: "Invalid image format. Only JPEG, PNG, and WebP images are allowed for profile pictures.",
                success: false
            });
        }

        const fileURI = getDataUri(file);

        let photoUrl = fileURI.content;
        if (process.env.CLOUD_NAME && process.env.API_KEY && process.env.API_SECRET) {
            try {
                const cloudResponse = await cloudinary.uploader.upload(fileURI.content, {
                    folder: "hirenest_avatars",
                    resource_type: "image"
                });
                if (cloudResponse && cloudResponse.secure_url) {
                    photoUrl = cloudResponse.secure_url;
                }
            } catch (cloudError) {
                console.error("CLOUDINARY PHOTO UPLOAD ERROR:", cloudError);
                return res.status(500).json({
                    message: "Failed to upload image to cloud storage",
                    success: false
                });
            }
        }

        user.profile.profilePhoto = photoUrl;
        await user.save();

        const updatedUser = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        };

        return res.status(200).json({
            message: "Profile photo updated successfully",
            user: updatedUser,
            success: true
        });
    } catch (error) {
        console.error("UPDATE PROFILE PHOTO ERROR:", error);
        return res.status(500).json({
            message: "Server error while updating profile photo",
            success: false
        });
    }
};

// ================= SAVED JOBS =================
export const saveJob = async (req, res) => {
    try {
        const userId = req.id;
        const { jobId } = req.params;

        // Check user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check job
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        // Already Saved?
        if (user.savedJobs.includes(jobId)) {
            return res.status(400).json({
                success: false,
                message: "Job already saved"
            });
        }

        // Save Job
        user.savedJobs.push(jobId);

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Job saved successfully"
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// ================ UNSAVE / REMOVE SAVED JOB ================
export const unsaveJob = async (req, res) => {
    try {
        const userId = req.id;
        const { jobId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.savedJobs = user.savedJobs.filter(
            (id) => id.toString() !== jobId.toString()
        );

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Job removed from saved collection"
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// =============== GET SAVED JOBS ===============
export const getSavedJobs = async (req, res) => {
    try {
        const user = await User.findById(req.id).populate({
            path: "savedJobs",
            populate: {
                path: "company"
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            savedJobs: user.savedJobs
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};