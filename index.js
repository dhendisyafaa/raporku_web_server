import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import AccountRoute from "./routes/account_route.js";
import AuthRoute from "./routes/auth_route.js";
import AvatarRoute from "./routes/avatar_route.js";
import DashboardRoute from "./routes/dashboard_route.js";
import GuruRoute from "./routes/guru_route.js";
import JurusanRoute from "./routes/jurusan_route.js";
import KelasRoute from "./routes/kelas_route.js";
import MapelRoute from "./routes/mapel_route.js";
import NilaiSiswaRoute from "./routes/nilai_siswa_routes.js";
import SiswaRoute from "./routes/siswa_route.js";
import TahunAjaranRoute from "./routes/tahun_ajaran_route.js";

import upload from "./utils/multer.js";
import db from "./config/db.js";
import Guru from "./models/guru_model.js";
import Jurusan from "./models/jurusan_model.js";
import Kelas from "./models/kelas_model.js";
import MaPel from "./models/mata_pelajaran.js";
import NilaiSiswa from "./models/nilai_siswa_model.js";
import Siswa from "./models/siswa_model.js";
import UserAccount from "./models/user_account.js";
import TahunAjaran from "./models/tahun_ajaran_model.js";
import NilaiAkhir from "./models/nilai_akhir_model.js";
import { initializeAdmin } from "./controllers/user_account_controller.js";

dotenv.config();
const app = express();

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "http://192.168.0.10:8080"],
  })
);
app.use(express.json());
app.use(upload.single("avatar"));

try {
  await db.authenticate();
  console.log("Database Connected");
  Siswa.sync();
  Kelas.sync();
  Jurusan.sync();
  Guru.sync();
  MaPel.sync();
  NilaiSiswa.sync();
  UserAccount.sync();
  TahunAjaran.sync();
  NilaiAkhir.sync();
  await initializeAdmin();
} catch (error) {
  console.error(error);
}

app.use(AccountRoute);
app.use(AuthRoute);
app.use(AvatarRoute);
app.use(DashboardRoute);
app.use(GuruRoute);
app.use(JurusanRoute);
app.use(KelasRoute);
app.use(MapelRoute);
app.use(NilaiSiswaRoute);
app.use(SiswaRoute);
app.use(TahunAjaranRoute);

app.listen(8080, () => {
  console.log(`Server is running on port 8080`);
});
