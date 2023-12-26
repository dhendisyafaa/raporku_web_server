import { Sequelize } from "sequelize";
import db from "../config/db.js";
import Siswa from "./siswa_model.js";
import Guru from "./guru_model.js";
import NilaiSiswa from "./nilai_siswa_model.js";
import NilaiAkhir from "./nilai_akhir_model.js";

const { DataTypes } = Sequelize;

const Kelas = db.define(
  "kelas",
  {
    id_kelas: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama_kelas: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255],
        notEmpty: true,
      },
      unique: true,
    },
    jumlah_siswa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
    hooks: {
      beforeValidate: (kelas, options) => {
        for (const key in kelas.dataValues) {
          if (kelas[key] && kelas[key].trim) {
            kelas[key] = kelas[key].trim();
          }
        }
      },
    },
  }
);

Kelas.hasMany(Siswa, {
  foreignKey: "id_kelas",
  as: "daftar_siswa",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

Siswa.belongsTo(Kelas, {
  foreignKey: "id_kelas",
  as: "kelas",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Kelas.hasOne(Guru, {
  foreignKey: "id_kelas",
  as: "wali_kelas",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

Guru.belongsTo(Kelas, {
  foreignKey: "id_kelas",
  as: "wali_kelas",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Kelas.hasMany(NilaiSiswa, {
  foreignKey: "id_kelas",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

NilaiSiswa.belongsTo(Kelas, {
  foreignKey: "id_kelas",
  as: "kelas",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Kelas.hasMany(NilaiAkhir, {
  foreignKey: "id_kelas",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

NilaiAkhir.belongsTo(Kelas, {
  foreignKey: "id_kelas",
  as: "kelas",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export default Kelas;

// (async () => {
//     await db.sync();
// })();
