import { Sequelize } from "sequelize";
import db from "../config/db.js";
import Kelas from "./kelas_model.js";

const { DataTypes } = Sequelize;

const Jurusan = db.define('jurusan', {
  id_jurusan: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nama_jurusan: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 255],
      notEmpty: true
    },
    unique: true,
  }
}, {
  freezeTableName: true,
  hooks: {
    beforeValidate: (jurusan, options) => {
      for (const key in jurusan.dataValues) {
        if (jurusan[key] && jurusan[key].trim) {
          jurusan[key] = jurusan[key].trim();
        }
      }
    }
  }
});

Jurusan.hasMany(Kelas, { 
  foreignKey: "id_jurusan" ,
  as: "kelas",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

Kelas.belongsTo(Jurusan, { 
  foreignKey: "id_jurusan",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});


export default Jurusan;

// (async () => {
//     await db.sync();
// })();