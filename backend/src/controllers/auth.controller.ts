import { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import {
  registerSchema,
  loginSchema,
  magicLinkRequestSchema,
  magicLinkVerifySchema,
  completeRegistrationSchema,
  completeProfileSchema,
} from "../validators/auth.schema.js";

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const user = await authService.registerUser(validatedData);
    res
      .status(201)
      .json({
        success: true,
        message: "User registered successfully",
        data: { id: user.id, email: user.email },
      });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const access_token = await authService.loginUser(
      validatedData.email,
      validatedData.password,
    );
    res.json({
      success: true,
      message: "Login successful",
      data: {
        access_token,
        token_type: "bearer",
      },
    });
  } catch (error: any) {
    res
      .status(401)
      .json({ success: false, message: error.errors || error.message });
  }
};

export const me = async (req: any, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.json({ success: true, message: "No active session", data: null });
  }
  const { password_hash, ...userProfile } = user;
  res.json({ success: true, message: "Profile fetched", data: userProfile });
};

export const logout = async (req: Request, res: Response) => {
  // Currently stateless JWT, so logout is primarily client-side token removal.
  // We return success to satisfy the API contract.
  res.json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) throw new Error("Email is required");
    
    await authService.forgotPassword(email, req.ip || '', req.headers['user-agent'] || '');

    res.json({
      success: true,
      message: "If an account exists, we've sent a password reset email.",
    });
  } catch (error: any) {
    // For security reasons, don't expose error details on forgot password
    res.status(200).json({ 
      success: true, 
      message: "If an account exists, we've sent a password reset email." 
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      throw new Error("Token and new password are required");
    
    await authService.resetPassword(token, password);

    res.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const sendMobileOtp = async (req: Request, res: Response) => {
  try {
    const { mobile, purpose = "login" } = req.body;
    if (!mobile) throw new Error("Mobile is required");

    await authService.sendMobileOtp(
      String(mobile),
      String(purpose),
      req.ip || "",
      String(req.headers["user-agent"] || ""),
    );

    res.json({
      success: true,
      message: "If the mobile number is valid, OTP has been sent.",
    });
  } catch (error: any) {
    const status = /too many otp requests/i.test(error.message) ? 429 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const verifyMobileOtp = async (req: Request, res: Response) => {
  try {
    const { mobile, otp, purpose = "login" } = req.body;
    const result = await authService.verifyMobileOtp(String(mobile), String(otp), String(purpose));
    res.json({
      success: true,
      message: "OTP verified successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const requestMagicLink = async (req: Request, res: Response) => {
  try {
    const { email } = magicLinkRequestSchema.parse(req.body);
    await authService.requestActivationMagicLink(
      email,
      req.ip || "",
      String(req.headers["user-agent"] || ""),
    );
    res.json({
      success: true,
      message: "If the email is available, an activation link has been sent.",
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors || error.message });
  }
};

export const verifyMagicLink = async (req: Request, res: Response) => {
  try {
    const { token } = magicLinkVerifySchema.parse(req.body);
    const data = await authService.verifyActivationMagicLink(token);
    res.json({ success: true, message: "Activation verified.", data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors || error.message });
  }
};

export const completeRegistration = async (req: Request, res: Response) => {
  try {
    const payload = completeRegistrationSchema.parse(req.body);
    const data = await authService.completeRegistrationFromActivation(payload);
    res.status(201).json({
      success: true,
      message: "Registration completed successfully.",
      data,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors || error.message });
  }
};

export const completeProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const payload = completeProfileSchema.parse(req.body);
    const data = await authService.completeUserProfile(req.user.id, payload);
    res.json({
      success: true,
      message: "Profile completed successfully.",
      data,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors || error.message });
  }
};
