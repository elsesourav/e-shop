import express, { Router } from "express";
import { userForgotPassword, userLogin, userRegistration, userResetPassword, userVerify, userVerifyForgotPassword } from "../controllers/auth.controller";

const router: Router = express.Router();

router.post("/user-registration", userRegistration);
router.post("/user-verify", userVerify);
router.post("/user-login", userLogin);
router.post("/user-forgot-password", userForgotPassword);
router.post("/user-verify-forgot-password", userVerifyForgotPassword);
router.post("/user-reset-password", userResetPassword);


export default router;