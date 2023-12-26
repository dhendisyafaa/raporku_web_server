import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

export const updateAvatar = async (model, id, idField, file) => {
  try {
    const resId = await model.findByPk(id);

    if (!resId) {
      return {
        success: false,
        message: `${model.getTableName()} ID not found`,
      };
    }

    const oldImagePath = `images/${resId.cloudinary_id}-${id}.jpg`;

    if (
      resId.avatar !==
      "https://res.cloudinary.com/dkpfsnpy1/image/upload/v1700316228/khw3ctf9xrlqgmazdcul.png"
    ) {
      await cloudinary.uploader.destroy(resId.cloudinary_id);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const result = await cloudinary.uploader.upload(file.path);

    const updateData = {
      avatar: result.secure_url,
      cloudinary_id: result.public_id,
    };

    if (
      updateData.avatar !==
      "https://res.cloudinary.com/dkpfsnpy1/image/upload/v1700316228/khw3ctf9xrlqgmazdcul.png"
    ) {
      const newImagePath = `images/${result.public_id}-${id}.jpg`;
      fs.renameSync(file.path, newImagePath);
    } else {
      fs.unlinkSync(file.path);
    }

    await model.update(updateData, { where: { [idField]: id } });

    return {
      success: true,
      message: `${model.getTableName()} avatar updated successfully`,
      response: updateData,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const deleteAvatar = async (model, id, idField) => {
  try {
    const resId = await model.findByPk(id);

    if (!resId) {
      return {
        success: false,
        message: `${model.getTableName()} ID not found`,
      };
    }

    if (
      resId.avatar !==
      "https://res.cloudinary.com/dkpfsnpy1/image/upload/v1700316228/khw3ctf9xrlqgmazdcul.png"
    ) {
      await cloudinary.uploader.destroy(resId.cloudinary_id);
    }

    const imagePath = `images/${resId.cloudinary_id}-${id}.jpg`;

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    const updateData = {
      avatar:
        "https://res.cloudinary.com/dkpfsnpy1/image/upload/v1700316228/khw3ctf9xrlqgmazdcul.png",
      cloudinary_id: "khw3ctf9xrlqgmazdcul",
    };
    await model.update(updateData, { where: { [idField]: id } });

    return {
      success: true,
      message: `${model.getTableName()} avatar deleted successfully`,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
