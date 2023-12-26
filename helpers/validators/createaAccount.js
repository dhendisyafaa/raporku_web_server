import UserAccount from "../../models/user_account.js";

export const createAccountSiswa = async (newSiswa) => {
  try {
    const { nis, id_siswa } = newSiswa;
    await UserAccount.create({
      username: nis,
      level: "siswa",
      password: Math.random().toString(36).slice(-6),
      id_user: id_siswa,
    });
  } catch (error) {
    console.error("Error creating user account for siswa:", error);
  }
};

export const updateUsernameOnUserAccount = async (oldUsername, newUsername) => {
  try {
    const updateUserAccountSiswa = await UserAccount.findOne({
      where: { username: oldUsername },
    });

    if (updateUserAccountSiswa) {
      updateUserAccountSiswa.username = newUsername;
      await updateUserAccountSiswa.save();
    }
  } catch (error) {
    console.error('Error in updateUsernameOnUserAccount:', error);
    throw error;
  }
};