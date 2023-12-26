import express from "express";
import {
  getAllAccount,
  getAccountById,
  getAdmin,
  getAdminById,
  createAdmin,
  updateAdmin
} from "../controllers/user_account_controller.js"

const router = express.Router();

router.get('/account', getAllAccount);
router.get('/account/:id', getAccountById);
router.get('/admin', getAdmin);
router.get('/admin/:id', getAdminById);
router.post('/admin', createAdmin);
router.patch('/admin/:id', updateAdmin);

export default router;