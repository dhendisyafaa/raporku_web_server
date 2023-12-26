import express from "express";
import{ getAllKelas, getKelasByIdWithThnAjaran, createKelas, updateKelas, deleteKelas } from "../controllers/kelas_controller.js";

const router = express.Router();

router.get('/kelas', getAllKelas);
router.get('/kelas/:id', getKelasByIdWithThnAjaran);
router.post('/kelas', createKelas);
router.patch('/kelas/:id', updateKelas);
router.delete('/kelas/:id', deleteKelas);

export default router;