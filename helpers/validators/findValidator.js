import Kelas from "../../models/kelas_model.js";

export const validateKelas = async (id_kelas) => {
  const kelas = await Kelas.findByPk(id_kelas);
  if (!kelas) {
    throw new Error(`ID kelas ${id_kelas} not found`);
  }
};