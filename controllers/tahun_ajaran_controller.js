import { handleInternalServerError } from "../helpers/handleError/sequelize_error.js";
import errorHandlers from "../helpers/handleError/errorHandle.js";
import TahunAjaran from "../models/tahun_ajaran_model.js";

// GET ALL
export const getAllTahunAjaran = async (req, res) => {
  try {
    const resThn = await TahunAjaran.findAll();
    res.status(200).json(resThn?.length 
      ? resThn 
      : { msg: "Tahun Ajaran not available.", data: [] });

  } catch (error) {
    handleInternalServerError(error, res);
  }
};


// GET by ID
export const getTahunAjaranById = async (req, res) => {
  try {
    const idThn = req.params.id;
    const resIdThn = await TahunAjaran.findByPk(idThn);

    return resIdThn
    ? res.status(200).json(resIdThn)
    : res.status(404).json({ msg: "ID Tahun Ajaran not found" });

  } catch (error) {
    handleInternalServerError(error, res);
  }
};


// CREATE
export const createTahunAjaran = async (req, res) => {
  try {
    const {
      kode_tahun_ajaran,
      tanggal_mulai,
      tanggal_berakhir,
    } = req.body;

    const newTahunAjaran = await TahunAjaran.create({
      kode_tahun_ajaran,
      tanggal_mulai,
      tanggal_berakhir,
    });

    return res.status(201).json({
      message: "Tahun Ajaran created successfully",
      response: newTahunAjaran,
    });
  } catch (error) {
    const errorHandler = errorHandlers[error.name] || handleInternalServerError;
    return errorHandler(error, res);
  }
};


export const updateTahunAjaran = async (req, res) => {
  try {
    const idThn = req.params.kode_tahun_ajaran;
    const resIdThn = await TahunAjaran.findByPk(idThn);

    if (!resIdThn) {
      return res.status(404).json({ msg: "ID Tahun Ajaran not found" });
    }

    const { kode_tahun_ajaran, tanggal_mulai, tanggal_berakhir } = req.body;

    const updateTahunAjaran = { kode_tahun_ajaran, tanggal_mulai, tanggal_berakhir};

    await TahunAjaran.update(updateTahunAjaran, { where: { kode_tahun_ajaran: idThn } });

    return res.status(200).json({
      message: "Tahun Ajaran updated successfully",
      response: updateTahunAjaran,
    });

  } catch (error) {
    const errorHandler = errorHandlers[error.name] || handleInternalServerError;
    return errorHandler(error, res);
  }
};
