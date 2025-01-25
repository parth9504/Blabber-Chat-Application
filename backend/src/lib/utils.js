//generate the token 
import jwt from 'jsonwebtoken'

export const generateToken=(userID,res)=>{
    const token=jwt.sign({userID},process.env.JWT_SECRET,{
        expiresIn:'7d',
    });
    //once token generated,send it as a cookie to the user..will be valid for 7days
    res.cookie("jwt",token,{
        maxAge:7*24*60*60*1000,
        httpOnly:true,
        sameSite:"strict",
        secure:process.env.NODE_ENV!=='development',
    });
    return token;
    };