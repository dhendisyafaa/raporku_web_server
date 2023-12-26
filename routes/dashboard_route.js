import express from "express";
import {
  getChartDataByIdSiswa,
  getChartDataTahunAjaran,
  getRankingByKelasId,
  getTotalNilaiAkhirByKelasId
} from "../controllers/dashboard_controller.js";

const router = express.Router();

router.get('/chart-siswa/:id', getChartDataByIdSiswa);
router.get('/chart-data/tahun-ajaran', getChartDataTahunAjaran);
router.get('/kelas-ranking/:id', getRankingByKelasId);
router.get('/total-nilai/:id', getTotalNilaiAkhirByKelasId)

export default router;