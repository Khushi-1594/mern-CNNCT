import User from '../models/user.js';
import bcrypt from "bcrypt";
import { generateTokenandSetCookie } from '../utils/generateToken.js';

export async function signup(req, res) {
    try {
        const { email, password, confirmPassword, username, firstName, lastName,category } = req.body;

        if (!email || !password || !confirmPassword || !username || !firstName || !lastName || !category) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        const emailregex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailregex.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email." });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match." });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must contain at least 6 characters." });
        }

        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({ success: false, message: "Email already exists." });
        }

        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByUsername) {
            return res.status(400).json({ success: false, message: "Username already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            password: hashedPassword, 
            username,
            firstName,
            lastName, 
            category,
        });

        await newUser.save();

        
        generateTokenandSetCookie(newUser._id, res);

        res.status(201).json({
            success: true,
            user: {
                ...newUser._doc,
                password: "",
            }
        });

    } catch (error) {
        console.error("Error in signup controller:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}


export async function login(req,res){
    try {
        const {username, password} = req.body;
        if(!username || !password){
            return res.status(400).json({success: false, message: "All fields are required."})
        }

        const existingUser = await User.findOne({username: username});
        if(!existingUser){
            return res.status(400).json({success: false, code: "INVALID_CREDENTIALS"})
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if(!isPasswordCorrect){
            return res.status(400).json({success: false, code: "INVALID_CREDENTIALS"})
        }

        await generateTokenandSetCookie(existingUser._id, res);
        res.status(201).json({success: true, 
            user : {
                ...existingUser._doc,
                password:"",
            }
        });
    } catch (error) {
        console.log("Error in login controller" , error.message);
        res.status(500).json({success: false, code:"INTERNAL_SERVER_ERROR"});
    }
}

export async function logout(req,res){
    try {
        res.clearCookie("jwt-cnnct",{
            httpOnly: true,  
            secure: process.env.NODE_ENV === "production", // Secure only in production
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", 
        });
        res.status(200).json({success: true, message: "Logged out successfully."});
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({success: false, message:"Internal server error."});    }
}

export async function authCheck(req,res){
    try {
        res.status(200).json({success: true, user: req.user})
    } catch (error) {
        console.log("Error in authCheck Controller", error.message);
        res.status(500).json({success: false, message:"Internal server error."})
    }
}