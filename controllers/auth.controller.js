// import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserAccount from "../models/user_account.js";

export const Login = async (req, res) => {
  try {
    const user = await UserAccount.findAll({
      where: {
        username: req.body.username,
      },
    });

    const username = user[0].username;
    const userId = user[0].id_user;
    const level = user[0].level;

    const accessToken = jwt.sign(
      { userId, username, level },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "2 days",
      }
    );

    res.status(200).json({ accessToken, level, username, userId });
  } catch (error) {
    console.log("error", error);
    res.status(404).json({ message: "username tidak ditemukan" });
  }
};
