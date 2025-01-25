import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/utils.js';
import cloudinary from '../lib/cloudinary.js';
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
    console.log(req.body);
    const { fullName, email, password } = req.body;
    console.log(fullName,email,password)
    try {
        //if either of the fields are left empty, throw error
        if(!fullName || !email|| !password)
            {
                return res.status(400).json({message:"Please fill all the field and try again"});
            }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password should be at least 6 chars long" });
        }
        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "Email already exists" });

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });

        if (newUser) {
            generateToken(newUser._id, res);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic
            });
        } else {
            res.status(400).json({ message: "Invalid User data" });
        }
    } catch (error) {
        console.log("Error in signup", error.message);
        res.status(500).json({ message: "Internal error" });
    }
};


//for the login of user..
export const login = async(req, res) => {
    const {email,password}=req.body
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    try {
        const user=await User.findOne({email});
        if(!user)
            {
                return res.status(400).json({message:"Invalid Credentials"});
            }
        //check if the password is correct.
        const passwordValid=await bcrypt.compare(password,user.password);
        //if password doesnt match..
        if(!passwordValid)
            {
                return res.status(400).json({message:"Invalid Credentials"});
            }
        //generate a jwt token
        generateToken(user._id,res);
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        });

        
    } catch (error) {
        res.status(400).json({message:"Internal error"});
        console.log("Error",error.message);
    }
};

//for logout
export const logout =async (req, res) => {
    //delete the cookies and logout..
    try {
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({message:"Logged out successfully"});
    } catch (error) {
        res.status(400).json({message:"Internal error"});
        console.log("Error logging out",error.message);
        
    }
};


//for updating profiles..
export const updateProfile=async(req,res)=> {
    try {
        const {profilePic}= req.body
        const userId=req.user._id
        if(!profilePic)
            {
                return res.status(401).json({message:"Profile pic needed"});
            }
        //add the new profile pic to cloudinary 
        const uploadResponse=await cloudinary.uploader.upload(profilePic)
        const updatedUser=await User.findByIdAndUpdate(
            userId,
            {profilePic:uploadResponse.secure_url},
            {new:true}
        );

        res.status(200).json(updatedUser)
    }
     catch (error) {
        console.log("Error in updating profile")
        return res.status(401).json({message:"Internal error"});
    }
};

//for user authentication
export const checkAuth = (req, res) => {
    try {
        console.log('Cookies received:', req.cookies); // Log cookies
        const token = req.cookies.jwt; // Extract jwt
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const user = jwt.verify(token, process.env.JWT_SECRET); // Verify token
        console.log('Decoded token:', user); // Log decoded data
        res.status(200).json(user);
    } catch (error) {
        console.error('checkAuth error:', error.message);
        res.status(401).json({ message: 'Unauthorized' });
    }
};
