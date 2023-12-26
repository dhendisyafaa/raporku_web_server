import { Sequelize } from "sequelize";
import db from "../config/db.js";
import NilaiSiswa from "./nilai_siswa_model.js";

const { DataTypes } = Sequelize;

const MaPel = db.define(
  "mata_pelajaran",
  {
    id_mata_pelajaran: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    kode_pelajaran: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 20],
        notEmpty: true,
      },
    },
    nama_pelajaran: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255],
        notEmpty: true,
      },
      unique: true,
    },
    bobot_nilai: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    hooks: {
      beforeValidate: (mata_pelajaran, options) => {
        for (const key in mata_pelajaran.dataValues) {
          if (mata_pelajaran[key] && mata_pelajaran[key].trim) {
            mata_pelajaran[key] = mata_pelajaran[key].trim();
          }
        }
      },
    },
  }
);

MaPel.hasMany(NilaiSiswa, {
  foreignKey: "id_mata_pelajaran",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

NilaiSiswa.belongsTo(MaPel, {
  foreignKey: "id_mata_pelajaran",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

export default MaPel;
