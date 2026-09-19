import User from "../../models/user.js";
import ContactMessage from "../../models/contactMessage.js";
import WorkoutTemplate from "../../models/adminWorkoutTemplate.js";

// @desc    Get Admin Platform Metrics & User Statistics
export const getAdminMetrics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const onboardedUsers = await User.countDocuments({ isOnboarded: true });
    const totalInquiries = await ContactMessage.countDocuments();
    
    // Fetch recent users
    const recentUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    // Fetch recent contact queries
    const recentMessages = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        onboardedUsers,
        totalInquiries,
        systemHealth: "Optimal",
      },
      recentUsers,
      recentMessages,
    });
  } catch (error) {
    console.error("Admin Metrics Error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching admin metrics." });
  }
};



// @desc    Get all workout templates
export const getWorkoutTemplates = async (req, res) => {
  try {
    const templates = await WorkoutTemplate.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, templates });
  } catch (error) {
    console.error("Fetch Templates Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching templates." });
  }
};

// @desc    Create a new workout template
export const createWorkoutTemplate = async (req, res) => {
  try {
    const { title, targetGoal, experienceLevel, schedule } = req.body;

    if (!title || !targetGoal || !experienceLevel) {
      return res.status(400).json({ success: false, message: "Please provide all required fields." });
    }

    const newTemplate = await WorkoutTemplate.create({
      title,
      targetGoal,
      experienceLevel,
      schedule: schedule || [],
      createdBy: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Workout template created successfully.",
      template: newTemplate,
    });
  } catch (error) {
    console.error("Create Template Error:", error);
    return res.status(500).json({ success: false, message: "Error creating template." });
  }
};

// @desc    Delete a workout template
export const deleteWorkoutTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await WorkoutTemplate.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Template not found." });
    }

    return res.status(200).json({ success: true, message: "Template deleted successfully." });
  } catch (error) {
    console.error("Delete Template Error:", error);
    return res.status(500).json({ success: false, message: "Error deleting template." });
  }
};

// @desc    Update or toggle user role (user <-> admin)
export const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role specified." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully.`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update User Role Error:", error);
    return res.status(500).json({ success: false, message: "Server error updating user role." });
  }
};