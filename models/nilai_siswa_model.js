import { Sequelize } from "sequelize";
import db from "../config/db.js";
import TahunAjaran from "./tahun_ajaran_model.js";

const { DataTypes } = Sequelize;

const NilaiSiswa = db.define('nilai_siswa', {
  id_nilai_siswa: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama_semester: { type: DataTypes.ENUM([ "1", "2", "3", "4", "5", "6" ]), allowNull: false },
  nilai_harian: { type: DataTypes.FLOAT, allowNull: false },
  nilai_semester: { type: DataTypes.FLOAT, allowNull: false },
  nilai_akhir: { type: DataTypes.FLOAT, allowNull: false },
}, {
  freezeTableName: true,
  hooks: {
    beforeValidate: (nilai_siswa, options) => {
      for (const key in nilai_siswa.dataValues) {
        if (nilai_siswa[key] && nilai_siswa[key].trim) {
          nilai_siswa[key] = nilai_siswa[key].trim();
        }
      }
    }
  }
});

NilaiSiswa.belongsTo(TahunAjaran, { foreignKey: "kode_tahun_ajaran", onDelete: "SET NULL", onUpdate: "CASCADE" });
TahunAjaran.hasMany(NilaiSiswa, { foreignKey: "kode_tahun_ajaran", onDelete: "SET NULL", onUpdate: "CASCADE" });

export default NilaiSiswa;

// (async () => {
//     await db.sync();
// })();