// routes/avatarRoutes.js
import express from "express";
import {
  updateAvatar,
  deleteAvatar
} from "../controllers/avatarController.js";

const router = express.Router();

router.patch("/avatar/:type/:id", updateAvatar);
router.delete("/avatar/:type/:id", deleteAvatar);

export default router;