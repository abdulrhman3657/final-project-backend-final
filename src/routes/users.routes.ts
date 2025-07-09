import express from "express";
import { getAllUsers, getOneUser, getMe, getMyIdeas, updateProfile } from "../controllers/users.controller";
import { authorized } from "../middleware/auth.middleware";


const router = express.Router();

router.get("/me", authorized, getMe)
router.get("/myIdeas", authorized, getMyIdeas)
router.put("/updateProfile", authorized, updateProfile)  
router.get("/:id", getOneUser);


export default router;
