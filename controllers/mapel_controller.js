import MaPel from "../models/mata_pelajaran.js";


// GET ALL MAPEL
export const getAllMapel = async (req, res) => {
  try {
    const resMapel = await MaPel.findAll();

    if (resMapel?.length) {
      res.status(200).json(resMapel);
    } else {
      res.status(404).json({ message: "Mapel not found." });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// CREATE MAPEL
export const createMapel = async (req, res) => {
  try {
    const {
      kode_pelajaran,
      nama_pelajaran,
      bobot_nilai
    } = req.body;

    const newMapel = await MaPel.create({
      kode_pelajaran,
      nama_pelajaran,
      bobot_nilai
    });

    return res.status(201).json({
      message: "Mata Pelajaran created successfully",
      response: newMapel,
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