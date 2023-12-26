import Kelas from "../models/kelas_model.js";
import Jurusan from "../models/jurusan_model.js";
import Guru from "../models/guru_model.js";
import Siswa from "../models/siswa_model.js";
import { handleInternalServerError } from "../helpers/handleError/sequelize_error.js";
import TahunAjaran from "../models/tahun_ajaran_model.js";


// GET ALL KELAS
export const getAllKelas = async (req, res) => {
  try {
    const resKelas = await Kelas.findAll({
      include: [
        { model: Guru, attributes: ['id_guru', 'nama_lengkap'], as: 'wali_kelas', },
        { model: Jurusan, attributes: ['nama_jurusan'], },
      ],
    });

    if (resKelas?.length) {
      res.status(200).json(resKelas);
    } else {
      res.status(404).json({ message: "Kelas not found." });
    }

  } catch (error) {
    handleInternalServerError(error, res);
  }
};


//** GET KELAS by ID or KODE TAHUN AJARAN */
export const getKelasByIdWithThnAjaran = async (req, res) => {
  try {
    const idKelas = req.params.id;
    const kodeTahunAjaran = req.query.kode_tahun_ajaran;

    if (!kodeTahunAjaran) {
      const resIdKelas = await Kelas.findByPk(idKelas, { include: [
        { model: Guru, attributes: ['id_guru', 'nama_lengkap'], as: 'wali_kelas' },
        { model: Siswa, attributes: ['id_siswa', 'nama_lengkap', 'kode_tahun_ajaran'], as: 'daftar_siswa' },
        { model: Jurusan, attributes: ['nama_jurusan'] },
      ] });

      return resIdKelas ? res.status(200).json(resIdKelas) : res.status(404).json({ msg: `ID Kelas ${idKelas} not found` });
    }

    // if there are query params
    const tahunAjaran = await TahunAjaran.findOne({ where: { kode_tahun_ajaran: kodeTahunAjaran }});
    if (!tahunAjaran) { return res.status(400).json({ msg: `Kode Tahun Ajaran ${kodeTahunAjaran} not found` }); }

    const kelasData = await Kelas.findAll({
      where: { id_kelas: idKelas },
      include: [
        { model: Guru, attributes: ['id_guru', 'nama_lengkap'], as: 'wali_kelas' },
        { model: Siswa, attributes: ['id_siswa', 'nama_lengkap', 'kode_tahun_ajaran'], as: 'daftar_siswa', where: { kode_tahun_ajaran: kodeTahunAjaran } },
        { model: Jurusan, attributes: ['nama_jurusan'] },
      ],
    });

    return res.status(200).json(kelasData?.length ? kelasData : { msg: `No classes found for Tahun Ajaran ${kodeTahunAjaran} in ID Kelas ${idKelas}`, data: [] });
  } catch (error) {
    handleInternalServerError(error, res);
  }
};


// POST KELAS
export const createKelas = async (req, res) => {
  try {
    const {
      nama_kelas,
      id_jurusan
    } = req.body;

    const jurusan = await Jurusan.findByPk(id_jurusan);
    if (!jurusan) {
      return res.status(400).json({ error: "Jurusan not found" });
    }

    const newKelas = await Kelas.create({
      nama_kelas,
      id_jurusan
    });

    return res.status(201).json({
      message: "Kelas created successfully",
      response: newKelas,
    });

  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      // Handle Unique Constraint Error
      const uniqueError = {
        field: error.errors[0].path,
        error: error.errors[0].message,
      };

      return res.status(400).json({ errors: [uniqueError] });
    } else if (error.name === "SequelizeValidationError") {
      // Handle Validation Errors
      const validationErrors = error.errors.map((err) => ({
        field: err.path,
        error: err.message,
      }));

      return res.status(400).json({ errors: validationErrors });
    } else {
      // Handle Other Types of Errors (if needed)
      console.log(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

// UPDATE KELAS by ID
export const updateKelas = async (req, res) => {
  try {
    const id = req.params.id;
    const resIdKelas = await Kelas.findByPk(id);

    if (!resIdKelas) {
      return res.status(404).json({ message: "ID Kelas not found" });
    }

    const {
      nama_kelas,
      id_jurusan
    } = req.body;

    const updateKelas = {
      nama_kelas,
      id_jurusan
    };

    const jurusan = await Jurusan.findByPk(id_jurusan);
    if (!jurusan) {
      return res.status(400).json({ error: "Jurusan not found" });
    }

    await Kelas.update(updateKelas, { where: { id_kelas: id } });

    return res.status(200).json({
      message: "Kelas updated successfully",
      response: updateKelas,
    });

  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      // Handle Unique Constraint Error
      const uniqueError = {
        field: error.errors[0].path,
        error: error.errors[0].message,
      };

      return res.status(400).json({ errors: [uniqueError] });
    } else if (error.name === "SequelizeValidationError") {
      // Handle Validation Errors
      const validationErrors = error.errors.map((err) => ({
        field: err.path,
        error: err.message,
      }));

      return res.status(400).json({ errors: validationErrors });
    } else {
      // Handle Other Types of Errors (if needed)
      console.log(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

// DELETE KELAS by ID
export const deleteKelas = async (req, res) => {
  try {
    const id = req.params.id;
    const resIdKelas = await Kelas.findByPk(id);

    if (!resIdKelas) {
      return res.status(404).json({ message: "ID Kelas not found" });
    }

    await Kelas.destroy({ where: { id_kelas: id } });

    return res.status(200).json({
      message: "Kelas deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};