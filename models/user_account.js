import { Sequelize } from "sequelize";
import db from "../config/db.js";

const { DataTypes } = Sequelize;

const UserAccount = db.define(
  "user_account",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      // allowNull: false,
      // unique: true,
    },
    password: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
    level: {
      type: DataTypes.ENUM("siswa", "guru", "admin"),
      // allowNull: false,
    },
    id_user: {
      type: DataTypes.INTEGER,
    },
  },
  {
    freezeTableName: true,
  }
);

export default UserAccount;
