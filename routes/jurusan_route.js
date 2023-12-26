import express from "express";
import{
    getAllJurusan,
    getJurusanById,
    createJurusan,
    updateJurusan,
    deleteJurusan
} from "../controllers/jurusan_controller.js"

const router = express.Router();

router.get('/jurusan', getAllJurusan);
router.get('/jurusan/:id', getJurusanById);
router.post('/jurusan', createJurusan);
router.patch('/jurusan/:id', updateJurusan);
router.delete('/jurusan/:id', deleteJurusan);

export default router;