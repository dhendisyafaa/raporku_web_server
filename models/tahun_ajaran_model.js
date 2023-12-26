import { Sequelize } from "sequelize";
import db from "../config/db.js";

const { DataTypes } = Sequelize;

const TahunAjaran = db.define('tahun_ajaran', {
  kode_tahun_ajaran: { type: DataTypes.STRING(255), primaryKey: true },
  tanggal_mulai: { type: DataTypes.DATEONLY, allowNull: false },
  tanggal_berakhir: { type: DataTypes.DATEONLY, allowNull: false },
  jumlah_peserta_didik: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, {
  freezeTableName: true,
});


export default TahunAjaran;

// (async () => {
//     await db.sync();
// })();