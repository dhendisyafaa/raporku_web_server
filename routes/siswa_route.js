import express from "express";
import {
  createSiswa,
  deleteSiswa,
  getAllSiswa,
  getAllSiswaByKelas,
  getSiswaById,
  updateSiswa,
} from "../controllers/siswa_controller.js";

const router = express.Router();

router.get("/siswa", getAllSiswa);
router.get("/siswa-kelas/:id_kelas", getAllSiswaByKelas);
router.get("/siswa/:id", getSiswaById);
router.post("/siswa", createSiswa);
router.patch("/siswa/:id", updateSiswa);
router.delete("/siswa/:id", deleteSiswa);
// router.get("/siswa-search", searchSiswa);

export default router;
