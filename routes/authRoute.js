import { Router } from "express";
import * as controller from "../controllers/authController.js";

const auth = Router();

auth.post("/signup", controller.signupValidation);
auth.post("/login", controller.login);

export default auth;
