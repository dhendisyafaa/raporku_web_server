import Kelas from "../../models/kelas_model.js";
import TahunAjaran from "../../models/tahun_ajaran_model.js";


export const addJumlahSiswa = async (kelas) => {
  await kelas.update({
    jumlah_siswa: kelas.jumlah_siswa + 1,
  });
};


export const updateJumlahSiswa = async (oldKelasId, newKelasId) => {
  try {
    if (oldKelasId !== newKelasId) {
      const oldKelas = await Kelas.findByPk(oldKelasId);
      if (oldKelas && oldKelas.jumlah_siswa > 0) {
        await oldKelas.update({
          jumlah_siswa: oldKelas.jumlah_siswa - 1,
        });
      }
    }

    const newKelas = await Kelas.findByPk(newKelasId);
      if (newKelas) {
        await newKelas.update({
          jumlah_siswa: newKelas.jumlah_siswa + 1,
        });
      }
  } catch (error) {
    throw error;
  }
};


export const addJumlahPesertaDidik = async (tahunAjaran) => {
  await tahunAjaran.update({
    jumlah_peserta_didik: tahunAjaran.jumlah_peserta_didik + 1,
  });
};


export const updateJumlahPesertaDidik = async (oldKodeTahunAjaran, newKodeTahunAjaran) => {
  try {
    if (oldKodeTahunAjaran !== newKodeTahunAjaran) {
      const oldTahunAjaran = await TahunAjaran.findByPk(oldKodeTahunAjaran);
      if (oldTahunAjaran && oldTahunAjaran.jumlah_peserta_didik > 0) {
        await oldTahunAjaran.update({
          jumlah_peserta_didik: oldTahunAjaran.jumlah_peserta_didik - 1,
        });
      }
    }

    const newTahunAjaran = await TahunAjaran.findByPk(newKodeTahunAjaran);
    if (newTahunAjaran) {
      await newTahunAjaran.update({
        jumlah_peserta_didik: newTahunAjaran.jumlah_peserta_didik + 1,
      });
    }
  } catch (error) {
    throw error;
  }
};