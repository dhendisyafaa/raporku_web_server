import express from "express";
import{
  getAllMapel,
  createMapel
} from "../controllers/mapel_controller.js"

const router = express.Router();

router.get('/mapel', getAllMapel);
// router.get('/kelas/:id', getKelasById);
router.post('/mapel', createMapel);
// router.patch('/kelas/:id', updateKelas);
// router.delete('/kelas/:id', deleteKelas);

export default router;