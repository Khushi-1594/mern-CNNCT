import User from "../models/user.js";
import bcrypt from "bcrypt";

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email, password,confirmPassword, photoUrl } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (photoUrl) updates.photoUrl = photoUrl;

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Email is already in use" });
      }
      updates.email = email;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });
    const shouldLogout = email || password;

    await user.save();

    res.status(200).json({
        success: true,
        user: shouldLogout ? null : updatedUser,
        message: "Profile updated successfully",
        shouldLogout,
      });
  } catch (error) {
    console.log("Error in updateProfile controller:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
