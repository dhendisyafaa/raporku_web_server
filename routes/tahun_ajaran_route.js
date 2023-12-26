import express from "express";
import {
  getAllTahunAjaran,
  createTahunAjaran,
  updateTahunAjaran
} from "../controllers/tahun_ajaran_controller.js"

const router = express.Router();

router.get('/tahun-ajaran', getAllTahunAjaran);
router.post('/tahun-ajaran', createTahunAjaran);
router.patch('/tahun-ajaran/:kode_tahun_ajaran', updateTahunAjaran);

export default router;