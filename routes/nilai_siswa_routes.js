import express from "express";
import{
  getAllNilaiSiswa,
  getNilaiSiswaById,
  getNilaiAkhir,
  createNilaiSiswa,
  updateNilaiSiswa
} from "../controllers/nilai_siswa_controller.js"

const router = express.Router();

router.get('/nilai-siswa', getAllNilaiSiswa);
router.get('/nilai-akhir', getNilaiAkhir);
router.get('/nilai-siswa/:id/nilai', getNilaiSiswaById);
router.post('/nilai-siswa', createNilaiSiswa);
router.patch('/nilai-siswa/:id_siswa/:nama_semester', updateNilaiSiswa)

export default router;