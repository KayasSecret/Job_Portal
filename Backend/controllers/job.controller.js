import { Job } from "../models/job.model.js";

export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;
        const userId = req.id;

    if(!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
        return res.status(400).json({
            message: "Something went wrong",
            success: false
        })
    }

    const job = await Job.create

    } catch(error) {
        console.log(error);
    }
}