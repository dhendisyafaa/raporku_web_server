import Kelas from "../models/kelas_model.js";
import Siswa from "../models/siswa_model.js";
import UserAccount from "../models/user_account.js";
import TahunAjaran from "../models/tahun_ajaran_model.js";
import errorHandlers from "../helpers/handleError/errorHandle.js";
import {
  addJumlahPesertaDidik,
  addJumlahSiswa,
  updateJumlahPesertaDidik,
  updateJumlahSiswa,
} from "../helpers/validators/updateKelas.js";
import {
  createAccountSiswa,
  updateUsernameOnUserAccount,
} from "../helpers/validators/createaAccount.js";
import { handleInternalServerError } from "../helpers/handleError/sequelize_error.js";
import { Op } from "sequelize";

export const getAllSiswa = async (req, res) => {
  try {
    const searchTerm = req.query.q;

    if (!searchTerm) {
      const resSiswa = await Siswa.findAll({
        include: [{ model: Kelas, attributes: ["nama_kelas"], as: "kelas" }],
      });
      return res
        .status(200)
        .json(
          resSiswa?.length
            ? resSiswa
            : { msg: "Siswa not available.", data: [] }
        );
    }

    const searchableAttributes = ["nis", "nisn", "nama_lengkap", "no_telepon"];

    const searchConditions = searchableAttributes.map((attribute) => ({
      [attribute]: { [Op.like]: `%${searchTerm}%` },
    }));

    const results = await Siswa.findAll({
      where: {
        [Op.or]: searchConditions,
      },
      include: [{ model: Kelas, attributes: ["nama_kelas"], as: "kelas" }],
    });

    if (results.length === 0) {
      return res
        .status(404)
        .json({ msg: `No matching records found for "${searchTerm}".` });
    }

    const matchingAttributes = [];
    const formattedResults = results.map((siswa) => {
      const matchingColumns = searchableAttributes.filter(
        (attribute) =>
          siswa[attribute] && siswa[attribute].toString().includes(searchTerm)
      );
      matchingAttributes.push(...matchingColumns);

      return siswa;
    });

    // const formattedMsg = `Found ${
    //   results.length
    // } record(s) matching "${searchTerm}" in the following attribute(s): ${[
    //   ...new Set(matchingAttributes),
    // ].join(", ")}.`;

    return res.status(200).json(formattedResults);
  } catch (error) {
    handleInternalServerError(error, res);
  }
};

//** GET ALL SISWA by ID KELAS */
export const getAllSiswaByKelas = async (req, res) => {
  try {
    const { id_kelas } = req.params;
    const kelas = await Kelas.findByPk(id_kelas);
    if (!kelas) {
      return res.status(400).json({ error: `ID kelas ${id_kelas} not found` });
    }

    const resSiswa = await Siswa.findAll({
      where: { id_kelas },
      include: [{ model: Kelas, attributes: ["nama_kelas"], as: "kelas" }],
    });

    res.status(200).json(
      resSiswa?.length
        ? resSiswa
        : {
            msg: `Siswa in class with ID ${id_kelas} not available.`,
            data: [],
          }
    );
  } catch (error) {
    handleInternalServerError(error, res);
  }
};

//** GET SISWA by ID */
export const getSiswaById = async (req, res) => {
  try {
    const idSiswa = req.params.id;
    const resIdSiswa = await Siswa.findByPk(idSiswa, {
      include: [{ model: Kelas, attributes: ["nama_kelas"], as: "kelas" }],
    });

    return resIdSiswa
      ? res.status(200).json(resIdSiswa)
      : res.status(404).json({ msg: `ID Siswa ${idSiswa} not found` });
  } catch (error) {
    handleInternalServerError(error, res);
  }
};

//** POST SISWA */
export const createSiswa = async (req, res) => {
  try {
    const {
      nis,
      nisn,
      nama_lengkap,
      tanggal_lahir,
      alamat,
      jenis_kelamin,
      no_telepon,
      tempat_lahir,
      nama_ayah,
      nama_ibu,
      tahun_masuk,
      tahun_lulus,
      id_kelas,
      kode_tahun_ajaran,
    } = req.body;

    const validations = [
      { field: "NIS", value: nis },
      { field: "NISN", value: nisn },
    ];

    const invalidFields = validations.filter((validation) => {
      const length = validation.value ? validation.value.length : 0;
      return length < 10 || length > 12;
    });

    if (invalidFields.length > 0) {
      const errorMessage = `Panjang ${invalidFields
        .map((field) => field.field)
        .join(" dan ")} harus antara 10 dan 12 karakter.`;
      return res.status(400).json({ error: errorMessage });
    }

    const kelas = await Kelas.findByPk(id_kelas);
    if (!kelas) {
      return res.status(400).json({ error: `ID kelas ${id_kelas} not found` });
    }

    const tahunAjaran = await TahunAjaran.findByPk(kode_tahun_ajaran);
    if (!tahunAjaran) {
      return res
        .status(400)
        .json({ error: `Kode Tahun Ajaran ${kode_tahun_ajaran} not found` });
    }

    const newSiswa = await Siswa.create({
      nis,
      nisn,
      nama_lengkap,
      tanggal_lahir,
      alamat,
      jenis_kelamin,
      no_telepon,
      tempat_lahir,
      nama_ayah,
      nama_ibu,
      tahun_masuk,
      tahun_lulus,
      id_kelas,
      avatar:
        "https://res.cloudinary.com/dkpfsnpy1/image/upload/v1700316228/khw3ctf9xrlqgmazdcul.png",
      cloudinary_id: "khw3ctf9xrlqgmazdcul",
      kode_tahun_ajaran,
    });

    await createAccountSiswa(newSiswa);

    await addJumlahSiswa(kelas);

    await addJumlahPesertaDidik(tahunAjaran);

    return res
      .status(201)
      .json({ message: "Siswa created successfully", response: newSiswa });
  } catch (error) {
    const errorHandler = errorHandlers[error.name] || handleInternalServerError;
    return errorHandler(error, res);
  }
};

//** UPDATE SISWA by ID */
export const updateSiswa = async (req, res) => {
  try {
    const id = req.params.id;
    const resIdSiswa = await Siswa.findByPk(id);
    if (!resIdSiswa) {
      return res.status(404).json({ msg: `ID Siswa ${id} not found` });
    }

    const {
      nis,
      nisn,
      nama_lengkap,
      tanggal_lahir,
      alamat,
      jenis_kelamin,
      no_telepon,
      tempat_lahir,
      nama_ayah,
      nama_ibu,
      tahun_masuk,
      tahun_lulus,
      id_kelas,
      kode_tahun_ajaran,
    } = req.body;

    const validations = [
      { field: "NIS", value: nis },
      { field: "NISN", value: nisn },
    ];

    const invalidFields = validations.filter((validation) => {
      const length = validation.value ? validation.value.length : 0;
      return length < 10 || length > 12;
    });

    if (invalidFields.length > 0) {
      const errorMessage = `Panjang ${invalidFields
        .map((field) => field.field)
        .join(" dan ")} harus antara 10 dan 12 karakter.`;
      return res.status(400).json({ error: errorMessage });
    }

    const kelas = await Kelas.findByPk(id_kelas);
    if (!kelas) {
      return res.status(400).json({ error: `ID Kelas ${kelas} not found` });
    }

    const tahunAjaran = await TahunAjaran.findByPk(kode_tahun_ajaran);
    if (!tahunAjaran) {
      return res
        .status(400)
        .json({ error: `Kode Tahun Ajaran ${kode_tahun_ajaran} not found` });
    }

    const updateSiswa = {
      nis,
      nisn,
      nama_lengkap,
      tanggal_lahir,
      alamat,
      jenis_kelamin,
      no_telepon,
      tempat_lahir,
      nama_ayah,
      nama_ibu,
      tahun_masuk,
      tahun_lulus,
      id_kelas,
      kode_tahun_ajaran,
    };

    await Siswa.update(updateSiswa, { where: { id_siswa: id } });

    await updateUsernameOnUserAccount(resIdSiswa.nis, nis);

    await updateJumlahSiswa(resIdSiswa.id_kelas, id_kelas);

    await updateJumlahPesertaDidik(
      resIdSiswa.kode_tahun_ajaran,
      kode_tahun_ajaran
    );

    return res
      .status(200)
      .json({ message: "Siswa updated successfully", response: updateSiswa });
  } catch (error) {
    const errorHandler = errorHandlers[error.name] || handleInternalServerError;
    return errorHandler(error, res);
  }
};

//** DELETE SISWA by ID */
export const deleteSiswa = async (req, res) => {
  try {
    const siswaId = req.params.id;
    const siswa = await Siswa.findByPk(siswaId);
    if (!siswa) {
      return res.status(404).json({ error: "Siswa not found" });
    }

    const id_kelas = siswa.id_kelas;
    const kodeTahunAjaran = siswa.kode_tahun_ajaran;

    // Update on jumlah_siswa
    const kelas = await Kelas.findByPk(id_kelas);
    if (kelas && kelas.jumlah_siswa > 0) {
      await kelas.update({
        jumlah_siswa: kelas.jumlah_siswa - 1,
      });
    }

    // Update on jumlah_peserta_didik
    const tahunAjaran = await TahunAjaran.findByPk(kodeTahunAjaran);
    if (tahunAjaran && tahunAjaran.jumlah_peserta_didik > 0) {
      await tahunAjaran.update({
        jumlah_peserta_didik: tahunAjaran.jumlah_peserta_didik - 1,
      });
    }

    await Siswa.destroy({ where: { id_siswa: siswaId } });

    // Delete on user_account
    const deletedUserAccount = await UserAccount.destroy({
      where: {
        username: siswa.nis,
      },
    });

    if (
      siswa.avatar !==
      "https://res.cloudinary.com/dkpfsnpy1/image/upload/v1700316228/khw3ctf9xrlqgmazdcul.png"
    ) {
      await cloudinary.uploader.destroy(siswa.cloudinary_id);
    }

    if (deletedUserAccount) {
      return res
        .status(200)
        .json({ msg: "Siswa and related User Account deleted successfully" });
    } else {
      return res
        .status(500)
        .json({ error: "Error deleting associated User Account" });
    }
  } catch (error) {
    const errorHandler = errorHandlers[error.name] || handleInternalServerError;
    return errorHandler(error, res);
  }
};

//** SEARCH SISWA*/
// export const searchSiswa = async (req, res) => {
//   try {
//     const searchTerm = req.query.q;

//     if (!searchTerm) {
//       return getAllSiswa(req, res);
//     }

//     const searchableAttributes = ["nis", "nisn", "nama_lengkap", "no_telepon"];

//     const searchConditions = searchableAttributes.map((attribute) => ({
//       [attribute]: { [Op.like]: `%${searchTerm}%` },
//     }));

//     const results = await Siswa.findAll({
//       where: {
//         [Op.or]: searchConditions,
//       },
//       include: [{ model: Kelas, attributes: ["nama_kelas"], as: "kelas" }],
//     });

//     if (results.length === 0) {
//       return res
//         .status(404)
//         .json({ msg: `No matching records found for "${searchTerm}".` });
//     }

//     const matchingAttributes = [];
//     const formattedResults = results.map((siswa) => {
//       const matchingColumns = searchableAttributes.filter(
//         (attribute) =>
//           siswa[attribute] && siswa[attribute].toString().includes(searchTerm)
//       );
//       matchingAttributes.push(...matchingColumns);

//       return siswa;
//     });

//     const formattedMsg = `Found ${
//       results.length
//     } record(s) matching "${searchTerm}" in the following attribute(s): ${[
//       ...new Set(matchingAttributes),
//     ].join(", ")}.`;

//     return res.status(200).json({
//       msg: formattedMsg,
//       data: formattedResults,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };
