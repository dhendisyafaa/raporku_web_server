// controllers/avatarController.js
import * as avatarHelper from "../helpers/avatarHelper.js";
import Siswa from '../models/siswa_model.js';
import Guru from '../models/guru_model.js';

export const updateAvatar = async (req, res) => {
  try {
    const { id, type } = req.params;

    let model, modelName, idField;

    if (type === "siswa") {
      model = Siswa;
      modelName = "Siswa";
      idField = "id_siswa"; // Gunakan nama kolom ID yang sesuai di model
    } else if (type === "guru") {
      model = Guru;
      modelName = "Guru";
      idField = "id_guru"; // Gunakan nama kolom ID yang sesuai di model
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user type" });
    }

    const result = await avatarHelper.updateAvatar(
      model,
      id,
      idField,
      req.file
    );
    return result.success
      ? res.status(200).json(result)
      : res.status(400).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteAvatar = async (req, res) => {
  const { id, type } = req.params;

  let model, modelName, idField;

  if (type === "siswa") {
    model = Siswa;
    modelName = "Siswa";
    idField = "id_siswa"; // Gunakan nama kolom ID yang sesuai di model
  } else if (type === "guru") {
    model = Guru;
    modelName = "Guru";
    idField = "id_guru"; // Gunakan nama kolom ID yang sesuai di model
  } else {
    return res
      .status(400)
      .json({ success: false, message: "Invalid user type" });
  }

  const result = await avatarHelper.deleteAvatar(model, id, idField);
  return result.success
    ? res.status(200).json(result)
    : res.status(400).json(result);
};
