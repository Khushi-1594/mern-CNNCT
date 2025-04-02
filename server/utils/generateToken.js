import jwt from 'jsonwebtoken';
import { ENV_VARS } from '../config/envVars.js';

export const generateTokenandSetCookie = (userId, res)=>{
    const token = jwt.sign({userId}, ENV_VARS.JWT_SECRET,{expiresIn:"20d"});

    res.cookie("jwt-cnnct",token, {
        maxAge: 20* 24*60*60*1000,
        httpOnly: true, //make sure that this cookie is only accessible via browser but not with js
        sameSite: "None",
        secure: ENV_VARS.NODE_ENV !== "development"
    });

    return token;
}