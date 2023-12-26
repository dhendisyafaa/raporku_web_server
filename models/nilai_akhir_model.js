import { Sequelize } from "sequelize";
import db from "../config/db.js";

const { DataTypes } = Sequelize;

const NilaiAkhir = db.define(
  "nilai_akhir",
  {
    id_nilai_akhir: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama_semester: { type: DataTypes.ENUM(["1", "2", "3", "4", "5", "6"]), allowNull: false },
    total_hasil_akhir: { type: DataTypes.FLOAT },
    rata_rata_nilai: { type: DataTypes.FLOAT },
    bobot_nilai_akhir: { type: DataTypes.FLOAT },
  },
  {
    freezeTableName: true,
  }
);

export default NilaiAkhir;
