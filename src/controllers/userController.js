import User from '../models/userModel.js'

const userController = {
    //GET ALL USER
    getAllUsers: async (req, res) => {
        try {
            const user = await User.find();
            res.status(200).json(user);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    //DELETE A USER
    deleteUser: async (req, res) => {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json("User deleted");
        } catch (err) {
            res.status(500).json(err);
        }
    },

    updateUser: async (req, res) => {
        try {
            const userId = req.params.id;
            const { username, email, password } = req.body;

            // Find the user by ID
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            // Update fields if provided
            if (username) user.username = username;
            if (email) user.email = email;

            // Update password if provided
            if (password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
            }

            // Save the updated user
            const updatedUser = await user.save();
            res.status(200).json({ success: true, message: "User updated", user: updatedUser });

        } catch (err) {
            res.status(500).json({ success: false, message: "An error occurred", error: err.message });
        }
    },
};

export default userController