import Jurusan from "../models/jurusan_model.js";
import Kelas from "../models/kelas_model.js";

// GET ALL JURUSAN
export const getAllJurusan = async (req, res) => {
  try {
    const resJurusan = await Jurusan.findAll();

    if (resJurusan?.length) {
      res.status(200).json(resJurusan);
    } else {
      res.status(404).json({ message: "Jurusan not found." });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET JURUSAN by ID
export const getJurusanById = async (req, res) => {
  try {
    const resIdJurusan = await Jurusan.findByPk(req.params.id, {
      include: [
        {
          model: Kelas,
          attributes: ['id_kelas', 'nama_kelas'],
          as: 'kelas',
        },
      ],
    });

    if (!resIdJurusan) {
      return res.status(404).json({ msg: "ID jurusan not found" });
    }

    return res.status(200).json(resIdJurusan);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// POST JURUSAN
export const createJurusan = async (req, res) => {
  try {
    const {
      nama_jurusan,
    } = req.body;

    const newJurusan = await Jurusan.create({
      nama_jurusan,
    });

    return res.status(201).json({
      message: "Jurusan created successfully",
      response: newJurusan,
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

// UPDATE JURUSAN by ID
export const updateJurusan = async (req, res) => {
  try {
    const id = req.params.id;
    const resIdJurusan = await Jurusan.findByPk(id);

    if (!resIdJurusan) {
      return res.status(404).json({ message: "ID Jurusan not found" });
    }

    const {
      nama_jurusan,
    } = req.body;

    const updateJurusan = {
      nama_jurusan,
    };

    await Jurusan.update(updateJurusan, { where: { id_jurusan: id } });

    return res.status(200).json({
      message: "Jurusan updated successfully",
      response: updateJurusan,
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

// DELETE JURUSAN by ID
export const deleteJurusan = async (req, res) => {
  try {
    const id = req.params.id;
    const resIdJurusan = await Jurusan.findByPk(id);

    if (!resIdJurusan) {
      return res.status(404).json({ message: "ID Jurusan not found" });
    }

    await Jurusan.destroy({ where: { id_jurusan: id } });

    return res.status(200).json({
      message: "Jurusan deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
