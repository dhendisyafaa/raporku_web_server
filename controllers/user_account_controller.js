import UserAccount from "../models/user_account.js";
import bcrypt from 'bcrypt';

// GET ACCOUNT
export const getAllAccount = async (req, res) => {
  try {
    const resSiswa = await UserAccount.findAll();

    if (resSiswa?.length) {
      res.status(200).json(resSiswa);
    } else {
      res.status(404).json({ message: "Account not found." });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// GET ACCOUNT by ID
export const getAccountById = async (req, res) => {
  try {
    const idUser = req.params.id;
    const resIdUser = await UserAccount.findByPk(idUser);

    if (!resIdUser) {
      return res.status(404).json({ msg: "ID account not found" });
    }

    return res.status(200).json(resIdUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const getAdminById = async (req, res) => {
  try {
    const existingAdmin = await UserAccount.findOne({
      where: { id_user: req.params.id },
    });

    if (!existingAdmin) {
      return res.status(404).json({ error: "Admin account not found." });
    }

    return res.status(200).json(existingAdmin);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// GET ADMIN Only
export const getAdmin = async (req, res) => {
  try {
    const adminAccounts = await UserAccount.findAll({
      where: { level: 'admin' },
    });

    if (adminAccounts?.length) {
      res.status(200).json(adminAccounts);
    } else {
      res.status(404).json({ message: "Admin accounts not found." });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const initializeAdmin = async () => {
  try {
    const existingAdmin = await UserAccount.findOne({
      where: { level: 'admin' },
    });

    if (!existingAdmin) {
      const adminUsername = 'admin';
      const adminPassword = 'admin';

      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await UserAccount.create({
        username: adminUsername,
        password: hashedPassword,
        level: "admin",
        id_user: "0",
      });

      console.log('Admin created successfully.');
    } else {
      console.log('Admin already exists.');
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
};


// CREATE ADMIN
export const createAdmin = async (req, res) => {
  try {
    const existingAdmin = await UserAccount.findOne({
      where: { level: 'admin' },
    });

    if (existingAdmin) {
      return res.status(400).json({ error: 'An admin already exists.' });
    }

    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserAccount.create({
      username,
      password: hashedPassword,
      level: "admin",
      id_user: "0",
    });

    return res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


// UPDATE ADMIN
export const updateAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Pastikan admin yang akan diperbarui ada
    const existingAdmin = await UserAccount.findOne({
      where: { level: 'admin' },
    });

    if (!existingAdmin) {
      return res.status(404).json({ error: 'Admin account not found.' });
    }

    let hashedPassword = existingAdmin.password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updatedAdmin = await existingAdmin.update({
      username,
      password: hashedPassword,
    });

    return res.status(200).json(updatedAdmin);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

