import { Resend } from "resend";
import User from "../../models/user.js";
import ContactMessage from "../../models/contactMessage.js";
import WorkoutTemplate from "../../models/adminWorkoutTemplate.js";
import AdminDietTemplate from "../../models/adminDietTemplate.js";
import WorkoutPlan from "../../models/workoutPlan.js";
import Announcement from "../../models/announcement.js";
import DietPlan from "../../models/dietPlan.js"; // 
import DietTemplate from "../../models/adminDietTemplate.js"; 


const resend = new Resend(process.env.RESEND_API_KEY);


// @desc    Get Admin Platform Metrics & User Statistics
export const getAdminMetrics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const onboardedUsers = await User.countDocuments({ isOnboarded: true });
    const totalInquiries = await ContactMessage.countDocuments();
    
    // Fetch recent users
    const recentUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    // Fetch recent contact queries
    const recentMessages = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .lean();

      const formattedMessages = recentMessages.map((msg) => ({
      ...msg,
      isRead: Boolean(msg.isRead),
    }));

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




// @desc    Get detailed user profile and active plans (workout + nutrition)
export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Lookup plan by userId directly (do not filter by isActive)
    const [activePlan, activeDiet] = await Promise.all([
      WorkoutPlan.findOne({ userId: id }),
      DietPlan.findOne({ userId: id }),
    ]);

    return res.status(200).json({
      success: true,
      user,
      activePlan,
      activeDiet,
    });
  } catch (error) {
    console.error("Get User Details Error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching user details." });
  }
};


// Example in adminController.js
export const getDietTemplates = async (req, res) => {
  try {
    const templates = await DietTemplate.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, templates }); // <-- key name
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create an admin diet template
export const createDietTemplate = async (req, res) => {
  try {
    const { title, targetGoal, dietaryType, dailyCalories, macros, meals } = req.body;

    if (!title || !targetGoal || !dailyCalories || !macros) {
      return res.status(400).json({ success: false, message: "Required fields missing." });
    }

    const template = await AdminDietTemplate.create({
      title,
      targetGoal,
      dietaryType,
      dailyCalories,
      macros,
      meals: meals || [],
      createdBy: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Diet template created successfully.",
      template,
    });
  } catch (error) {
    console.error("Create Diet Template Error:", error);
    return res.status(500).json({ success: false, message: "Error creating diet template." });
  }
};

// @desc    Delete an admin diet template
export const deleteDietTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await AdminDietTemplate.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Diet template not found." });
    }

    return res.status(200).json({ success: true, message: "Diet template deleted." });
  } catch (error) {
    console.error("Delete Diet Template Error:", error);
    return res.status(500).json({ success: false, message: "Error deleting diet template." });
  }
};


 // Ensure path is correct

// @desc    Mark contact inquiry as read
export const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await ContactMessage.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }

    return res.status(200).json({ success: true, message });
  } catch (error) {
    console.error("Mark Read Error:", error);
    return res.status(500).json({ success: false, message: "Server error marking as read." });
  }
};

// @desc    Toggle block/unblock status for a user
export const toggleBlockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from blocking themselves
    if (userId === req.user.userId) {
      return res.status(400).json({ success: false, message: "You cannot block your own admin account." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User account ${user.isBlocked ? "suspended" : "reactivated"} successfully.`,
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    console.error("Toggle Block User Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update block status." });
  }
};

// @desc    Permanently delete a user account and associated data
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Resolve the requesting admin's ID correctly
    const currentAdminId = req.user?._id ? req.user._id.toString() : req.user?.id;

    // Prevent admin from deleting themselves
    if (currentAdminId && currentAdminId === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account.",
      });
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found or already deleted.",
      });
    }

    // Safely delete associated user plans without crashing if model isn't configured
    try {
      if (typeof WorkoutPlan !== "undefined" && WorkoutPlan.deleteMany) {
        await WorkoutPlan.deleteMany({ userId });
      }
    } catch (cleanupErr) {
      console.warn("User plan cleanup non-fatal notice:", cleanupErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "User account deleted permanently.",
    });
  } catch (error) {
    console.error("Delete User Server Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete user.",
    });
  }
};

// @desc    Delete a contact inquiry
export const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ContactMessage.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Message inquiry not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Inquiry removed successfully.",
    });
  } catch (error) {
    console.error("Delete Contact Message Error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete inquiry." });
  }
};



// @desc    Reply directly to a contact inquiry via email
export const replyToContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyText } = req.body;

    if (!replyText || !replyText.trim()) {
      return res.status(400).json({ success: false, message: "Reply message cannot be empty." });
    }

    const inquiry = await ContactMessage.findById(id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found." });
    }

    // 1. Send the email via Resend to the user
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "KineticOS Support <onboarding@resend.dev>",
        to: [inquiry.email],
        subject: `Re: ${inquiry.subject || "Your inquiry with KineticOS"}`,
        html: `
          <div style="font-family: sans-serif; padding: 24px; background: #09090b; color: #f4f4f5; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255, 255, 255, 0.1);">
            <h2 style="color: #a78bfa; margin-top: 0;">KineticOS Support Response</h2>
            <p>Hi <strong>${inquiry.name}</strong>,</p>
            <div style="background: #18181b; padding: 16px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); margin: 16px 0; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">
              ${replyText}
            </div>
            <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 20px 0;" />
            <p style="font-size: 11px; color: #71717a; margin-bottom: 4px;">In response to your query:</p>
            <blockquote style="font-size: 12px; color: #a1a1aa; margin: 0; padding-left: 10px; border-left: 2px solid #7c3aed;">
              "${inquiry.message}"
            </blockquote>
          </div>
        `,
      });
    }

    // 2. Mark as read & store reply state
    inquiry.isRead = true;
    inquiry.reply = replyText;
    inquiry.repliedAt = new Date();
    await inquiry.save();

    return res.status(200).json({
      success: true,
      message: "Reply sent successfully.",
      updatedMessage: inquiry,
    });
  } catch (error) {
    console.error("Reply to message error:", error);
    return res.status(500).json({ success: false, message: "Failed to dispatch email reply." });
  }
};

// @desc    Assign a preset template directly to a user
export const assignTemplateToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { templateId } = req.body;

    if (!templateId) {
      return res.status(400).json({ success: false, message: "Template ID is required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const template = await WorkoutTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ success: false, message: "Workout template not found." });
    }

    // 1. Resolve schema-required fields
    const resolvedGoal =
      template.targetGoal ||
      template.goal ||
      user.profile?.primaryGoal ||
      "Muscle Gain";

    const resolvedExperience =
      template.experienceLevel ||
      user.profile?.experienceLevel ||
      "beginner";

    const resolvedActivityLevel =
      template.activityLevel ||
      user.profile?.activityLevel ||
      "moderate";

    // 2. Explicitly map and preserve nested exercises array
    const defaultDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const formattedSchedule = (template.schedule || []).map((item, index) => {
      const plainItem = item.toObject ? item.toObject() : { ...item };
      return {
        dayName: plainItem.dayName || plainItem.day || defaultDays[index % 7],
        focus: plainItem.focus || "Full Body",
        isRestDay: Boolean(plainItem.isRestDay),
        exercises: (plainItem.exercises || []).map((ex) => ({
          name: ex.name,
          sets: Number(ex.sets) || 3,
          reps: String(ex.reps || "8-10"),
          restSeconds: Number(ex.restSeconds) || 60,
          formGuidance: ex.formGuidance || "",
        })),
      };
    });

    const planData = {
      userId,
      goal: resolvedGoal,
      experienceLevel: resolvedExperience,
      activityLevel: resolvedActivityLevel,
      weekNumber: 1,
      schedule: formattedSchedule,
    };

    // 3. Upsert using strict matching on userId
    const activePlan = await WorkoutPlan.findOneAndUpdate(
      { userId },
      { $set: planData },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: `Assigned workout template "${template.title}" to ${user.name}.`,
      activePlan,
    });
  } catch (error) {
    console.error("Assign Template Server Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to assign template.",
    });
  }
};

// @desc    Remove/delete a user's assigned workout plan
export const deleteUserWorkoutPlan = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Delete the assigned plan for this user
    await WorkoutPlan.findOneAndDelete({ userId });

    return res.status(200).json({
      success: true,
      message: `Workout routine removed for ${user.name}.`,
    });
  } catch (error) {
    console.error("Delete User Workout Plan Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove workout plan.",
    });
  }
};

// @desc    Get all announcements (Admin view)
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, announcements });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new platform announcement
export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: "Title and message are required." });
    }

    const announcement = await Announcement.create({
      title,
      message,
      type: type || "info",
      createdBy: req.user?._id || req.user?.id,
    });

    return res.status(201).json({ success: true, announcement });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle active state of an announcement
export const toggleAnnouncementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found." });
    }

    announcement.isActive = !announcement.isActive;
    await announcement.save();

    return res.status(200).json({ success: true, announcement });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    await Announcement.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Announcement deleted." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current active announcement for users (Public or Authenticated)
export const getActiveAnnouncement = async (req, res) => {
  try {
    const active = await Announcement.findOne({ isActive: true }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, announcement: active || null });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const assignDietTemplateToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { templateId } = req.body;

    if (!templateId) {
      return res.status(400).json({ success: false, message: "Diet template ID is required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const template = await DietTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ success: false, message: "Diet template not found." });
    }

    // Resolve plan fields and fallbacks to prevent schema validation failures
    const resolvedGoal =
      template.targetGoal ||
      template.goal ||
      user.profile?.primaryGoal ||
      "Healthy Maintenance";

    const dietData = {
      userId,
      title: template.title || "Custom Nutrition Routine",
      goal: resolvedGoal,
      targetGoal: resolvedGoal,
      dietaryPreference:
        template.dietaryPreference ||
        user.profile?.dietaryPreference ||
        "Non-Veg",
      caloriesTarget: template.caloriesTarget || template.calories || 2000,
      macros: {
        protein: template.macros?.protein || 150,
        carbs: template.macros?.carbs || 200,
        fats: template.macros?.fats || 65,
      },
      meals: template.meals || [],
      isActive: true,
      assignedByAdmin: true,
    };

    // Upsert logic to prevent duplicate key errors on userId
    const activeDiet = await DietPlan.findOneAndUpdate(
      { userId },
      { $set: dietData },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: `Assigned diet blueprint "${template.title}" to ${user.name}.`,
      activeDiet,
    });
  } catch (error) {
    console.error("Assign Diet Template Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to assign diet template.",
    });
  }
};

// @desc    Remove/delete a user's assigned diet plan
export const deleteUserDietPlan = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    await DietPlan.findOneAndDelete({ userId });

    return res.status(200).json({
      success: true,
      message: `Diet routine removed for ${user.name}.`,
    });
  } catch (error) {
    console.error("Delete Diet Plan Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove diet routine.",
    });
  }
};