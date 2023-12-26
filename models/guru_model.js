import { Sequelize } from "sequelize";
import db from "../config/db.js";
import NilaiSiswa from "./nilai_siswa_model.js";
import UserAccount from "./user_account.js";

const { DataTypes } = Sequelize;

const Guru = db.define(
  "guru",
  {
    id_guru: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nip: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 20],
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    nama_lengkap: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255],
        notEmpty: true,
      },
    },
    tanggal_lahir: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: {
          msg: "Invalid. Use format YYYY-MM-DD.",
        },
      },
    },
    alamat: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255],
      },
    },
    jenis_kelamin: {
      type: DataTypes.ENUM("L", "P"),
      allowNull: false,
    },
    no_telepon: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 20],
        notEmpty: true,
      },
    },
    tempat_lahir: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255],
        notEmpty: true,
      },
    },
    pendidikan_tertinggi: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255],
        notEmpty: true,
      },
    },
    avatar: {
      type: DataTypes.STRING,
    },
    cloudinary_id: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
    hooks: {
      beforeCreate: (guru) => {
        for (const key in guru.dataValues) {
          if (guru[key] && typeof guru[key] === "string") {
            guru[key] = guru[key].trim();
          }
        }
      },
      afterCreate: async (guru) => {
        try {
          const { email, id_guru } = guru;
          await UserAccount.create({
            username: email,
            level: "guru",
            password: Math.random().toString(36).slice(-6),
            id_user: id_guru,
          });
        } catch (error) {
          console.error("Error creating user account for guru:", error);
        }
      },
    },
  }
);

// Guru.hasOne(UserAccount, {
//   foreignKey: 'username',
//   sourceKey: 'email',
// });

UserAccount.belongsTo(Guru, { foreignKey: "id_user", constraints: false });
Guru.hasOne(UserAccount, { foreignKey: "id_user", constraints: false });

Guru.hasMany(NilaiSiswa, {
  foreignKey: "id_guru",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

NilaiSiswa.belongsTo(Guru, {
  foreignKey: "id_guru",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

export default Guru;

// (async () => {
//     await db.sync();
// })();
