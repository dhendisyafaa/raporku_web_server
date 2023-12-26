import Guru from "../models/guru_model.js";
import Kelas from "../models/kelas_model.js";
import UserAccount from "../models/user_account.js";
import errorHandlers from "../helpers/handleError/errorHandle.js";
import { handleInternalServerError } from "../helpers/handleError/sequelize_error.js";
import { Sequelize } from "sequelize";
import validateEmail from "../helpers/validators/emailGuru.js";

//** GET ALL GURU */
export const getAllGuru = async (req, res) => {
  try {
    const resGuru = await Guru.findAll({
      include: [{ model: Kelas, attributes: ["nama_kelas"], as: "wali_kelas" }],
    });
    res
      .status(200)
      .json(
        resGuru?.length ? resGuru : { msg: "Guru not available.", data: [] }
      );
  } catch (error) {
    handleInternalServerError(error, res);
  }
};

//** GET GURU by ID */
export const getGuruById = async (req, res) => {
  try {
    const idGuru = req.params.id;
    const resIdGuru = await Guru.findByPk(idGuru, {
      include: [{ model: Kelas, attributes: ["nama_kelas"], as: "wali_kelas" }],
    });

    return resIdGuru
      ? res.status(200).json(resIdGuru)
      : res.status(404).json({ msg: `ID Guru ${idGuru} not found` });
  } catch (error) {
    handleInternalServerError(error, res);
  }
};

//** POST GURU */
export const createGuru = async (req, res) => {
  try {
    const {
      nip,
      email,
      nama_lengkap,
      tanggal_lahir,
      alamat,
      jenis_kelamin,
      no_telepon,
      tempat_lahir,
      pendidikan_tertinggi,
      id_kelas,
    } = req.body;

    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ error: "Alamat email harus menggunakan @guru.smk.belajar.id" });
    }

    const existingGuru = await Guru.findOne({ where: { id_kelas } });
    if (existingGuru) {
      return res
        .status(400)
        .json({ error: `Kelas dengan ID ${id_kelas} sudah memiliki guru.` });
    }

    const kelas = await Kelas.findByPk(id_kelas);
    if (!kelas) {
      return res.status(400).json({ error: `ID kelas ${id_kelas} not found` });
    }

    const newGuru = await Guru.create({
      nip,
      email,
      nama_lengkap,
      tanggal_lahir,
      alamat,
      jenis_kelamin,
      no_telepon,
      tempat_lahir,
      pendidikan_tertinggi,
      id_kelas,
      avatar:
        "https://res.cloudinary.com/dkpfsnpy1/image/upload/v1700316228/khw3ctf9xrlqgmazdcul.png",
      cloudinary_id: "khw3ctf9xrlqgmazdcul",
    });

    return res
      .status(201)
      .json({
        message: "Guru and corresponding user account created successfully",
        response: newGuru,
      });
  } catch (error) {
    const errorHandler = errorHandlers[error.name] || handleInternalServerError;
    return errorHandler(error, res);
  }
};

//** UPDATE GURU by ID */
export const updateGuru = async (req, res) => {
  try {
    const id = req.params.id;
    const resIdGuru = await Guru.findByPk(id);
    if (!resIdGuru) {
      return res.status(404).json({ message: `ID Guru ${id} not found` });
    }

    const {
      nip,
      email,
      nama_lengkap,
      tanggal_lahir,
      alamat,
      jenis_kelamin,
      no_telepon,
      tempat_lahir,
      pendidikan_tertinggi,
      id_kelas,
    } = req.body;

    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ error: "Alamat email harus menggunakan @guru.smk.belajar.id" });
    }

    const availableClass = await Kelas.findByPk(id_kelas);
    if (!availableClass) {
      return res.status(400).json({ error: `ID Kelas ${id_kelas} not found` });
    }

    if (id_kelas && id_kelas !== resIdGuru.id_kelas) {
      const isClassAvailable = await Guru.findOne({
        where: { id_kelas, id_guru: { [Sequelize.Op.not]: id } },
      });
      if (isClassAvailable) {
        return res
          .status(400)
          .json({
            error: `ID Kelas ${id_kelas} telah dimiliki oleh guru lain.`,
          });
      }
    }

    const updateGuru = {
      nip,
      email,
      nama_lengkap,
      tanggal_lahir,
      alamat,
      jenis_kelamin,
      no_telepon,
      tempat_lahir,
      pendidikan_tertinggi,
      id_kelas,
    };

    await Guru.update(updateGuru, { where: { id_guru: id } });

    const user = await UserAccount.findOne({
      where: { username: resIdGuru.email },
    });
    if (user) {
      user.username = email;
      await user.save();
    }

    return res
      .status(200)
      .json({ message: "Guru updated successfully", response: updateGuru });
  } catch (error) {
    const errorHandler = errorHandlers[error.name] || handleInternalServerError;
    return errorHandler(error, res);
  }
};

// DELETE GURU by ID
export const deleteGuru = async (req, res) => {
  try {
    const guruId = req.params.id;
    const guru = await Guru.findByPk(guruId);
    if (!guru) {
      return res.status(404).json({ error: "Guru not found" });
    }

    await Guru.destroy({ where: { id_guru: guruId } });

    if (
      guru.avatar !==
      "https://res.cloudinary.com/dkpfsnpy1/image/upload/v1700316228/khw3ctf9xrlqgmazdcul.png"
    ) {
      await cloudinary.uploader.destroy(guru.cloudinary_id);
    }

    const deletedUserAccount = await UserAccount.destroy({
      where: { username: guru.email },
    });
    if (deletedUserAccount) {
      return res
        .status(200)
        .json({
          message: "Guru and related User Account deleted successfully",
        });
    } else {
      return res
        .status(500)
        .json({ error: "Error deleting associated User Account" });
    }
  } catch (error) {
    handleInternalServerError(error, res);
  }
};
