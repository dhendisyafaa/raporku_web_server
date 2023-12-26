import NilaiSiswa from "../models/nilai_siswa_model.js";
import Siswa from "../models/siswa_model.js";
import Guru from "../models/guru_model.js";
import MaPel from "../models/mata_pelajaran.js";
import Kelas from "../models/kelas_model.js";
import errorHandlers from "../helpers/handleError/errorHandle.js";
import { handleInternalServerError } from "../helpers/handleError/sequelize_error.js";
import NilaiAkhir from "../models/nilai_akhir_model.js";

// GET ALL SISWA
export const getAllNilaiSiswa = async (req, res) => {
  try {
    const resSiswa = await NilaiSiswa.findAll();
    if (resSiswa?.length) { res.status(200).json(resSiswa);
    } else { res.status(404).json({ message: "Siswa not found." });}
  } catch (error) {
    handleInternalServerError(error, res);
  }
};

//** GET NILAI AKHIR */
export const getNilaiAkhir = async (req, res) => {
  try {
    const resNilaiAkhir = await NilaiAkhir.findAll();

    res.status(200).json(resNilaiAkhir?.length ? resNilaiAkhir : { msg: "Data Nilai Akhir not available.", data: [] });
  } catch (error) {
    handleInternalServerError(error, res);
  }
};


// GET NILAI SISWA by ID SISWA w/ ID SEMESTER
export const getNilaiSiswaById = async (req, res) => {
  try {
    const idSiswa = req.params.id;
    const targetSemester = req.query.nama_semester;

    const isValidSemester = /^[1-6]$/.test(targetSemester);
    if (!isValidSemester) { return res.status(400).json({ error: "Invalid value for 'nama_semester'. It should be a number between 1 and 6." });}

    const siswaInfo = await Siswa.findByPk(idSiswa, { attributes: ["nama_lengkap", "nis", "nisn", "jenis_kelamin"] });
    if (!siswaInfo) { return res.status(400).json({ error: `ID Siswa ${idSiswa} not found` });}

    const formattedSiswaInfo = {
      nama_lengkap: siswaInfo.nama_lengkap,
      nis: siswaInfo.nis,
      nisn: siswaInfo.nisn,
      jenis_kelamin: siswaInfo.jenis_kelamin,
      kode_tahun_ajaran: null,
      id_kelas: null,
    };

    const nilaiSiswa = await NilaiSiswa.findAll({ where: { id_siswa: idSiswa, nama_semester: targetSemester }});

    const groupedNilai = {};

    const namaSemester = targetSemester || "Masukkan Value Semester...";

    let totalHasilAkhir = 0;
    let totalBobot = 0;
    let totalHasilAkhirPure = 0; // Tanpa dikalikan bobot
    let jumlahNilai = 0;

    for (const nilai of nilaiSiswa) {
      const idMataPelajaran = nilai.id_mata_pelajaran;

      const mataPelajaranInfo = await MaPel.findByPk(idMataPelajaran, {
        attributes: ["nama_pelajaran", "bobot_nilai"],
      });

      if (formattedSiswaInfo.id_kelas === null) {
        formattedSiswaInfo.id_kelas = nilai.id_kelas;
      }

      if (!groupedNilai[mataPelajaranInfo.nama_pelajaran]) {
        groupedNilai[mataPelajaranInfo.nama_pelajaran] = {
          bobot: mataPelajaranInfo.bobot_nilai,
          nilai: [],
        };
      }

      const nilaiAkhir = nilai.nilai_akhir;

      groupedNilai[mataPelajaranInfo.nama_pelajaran].nilai.push({
        nilai_harian: nilai.nilai_harian,
        nilai_semester: nilai.nilai_semester,
        nilai_akhir: nilaiAkhir,
      });

      if (formattedSiswaInfo.kode_tahun_ajaran === null) {
        formattedSiswaInfo.kode_tahun_ajaran = nilai.kode_tahun_ajaran;
      }

      // total nilai akhir dan bobot
      totalHasilAkhir += nilaiAkhir * mataPelajaranInfo.bobot_nilai;
      totalBobot += mataPelajaranInfo.bobot_nilai;

      // total nilai akhir tanpa dikalikan bobot
      totalHasilAkhirPure += nilaiAkhir;

      jumlahNilai++;
    }

    // Rata rata nilai w/ bobot
    // const rataRataNilai = totalHasilAkhir / jumlahNilai;

    // Hitung bobot nilai akhir
    const bobotNilaiAkhir = totalHasilAkhir / totalBobot;

    // Tambahkan properti total_hasil_akhir_pure
    const totalHasilAkhirPureFormatted = totalHasilAkhirPure.toFixed(2);

    // Tambahkan properti rata_rata_nilai_pure
    const rataRataNilaiPure = totalHasilAkhirPure / jumlahNilai;

    const result = {
      id_siswa: idSiswa,
      nama_semester: namaSemester,
      siswa_info: formattedSiswaInfo,
      nilai_siswa: groupedNilai,
      total_hasil_akhir: totalHasilAkhirPureFormatted,
      rata_rata_nilai: rataRataNilaiPure.toFixed(2),
      bobot_nilai_akhir: bobotNilaiAkhir.toFixed(2),
    };

    res.status(200).json(result);
  } catch (error) {
    const errorHandler = errorHandlers[error.name] || handleInternalServerError;
    return errorHandler(error, res);
  }
};


// CREATE NILAI
export const createNilaiSiswa = async (req, res) => {
  try {
    const {
      id_siswa,
      id_guru,
      id_kelas,
      nama_semester,
      kode_tahun_ajaran,
      nilai_mata_pelajaran,
    } = req.body;

    const siswa = await Siswa.findByPk(id_siswa);
    if (!siswa) {
      return res.status(400).json({ error: "Siswa not found" });
    }

    const guru = await Guru.findByPk(id_guru);
    if (!guru) {
      return res.status(400).json({ error: "Guru not found" });
    }

    const kelas = await Kelas.findByPk(id_kelas);
    if (!kelas) {
      return res.status(400).json({ error: "Kelas not found" });
    }

    const existingNilai = await NilaiSiswa.findOne({
      where: { id_siswa, nama_semester },
    });
    if (existingNilai) {
      return res
        .status(400)
        .json({
          error: `Nilai for id_siswa ${id_siswa} and nama_semester ${nama_semester} already exists.`,
        });
    }

    const isValidSemester = /^[1-6]$/.test(nama_semester);
    if (!isValidSemester) {
      return res
        .status(400)
        .json({
          error: `Invalid value for 'nama_semester ${nama_semester}'. It should be a number between 1 and 6.`,
        });
    }

    // Validate order of nama_semester
    const latestNilai = await NilaiSiswa.findOne({
      where: { id_siswa },
      order: [["nama_semester", "DESC"]],
    });
    if (latestNilai) {
      const latestSemester = parseInt(latestNilai.nama_semester, 10);
      if (latestSemester >= parseInt(nama_semester, 10)) {
        return res
          .status(400)
          .json({
            error: `Invalid order for 'nama_semester'. It should be greater than ${latestSemester}.`,
          });
      }
    }

    // Validate order of nama_semester for uploaded nilai
    const uploadedSemester = parseInt(nama_semester, 10);
    if (latestNilai) {
      const latestSemester = parseInt(latestNilai.nama_semester, 10);
      if (latestSemester + 1 !== uploadedSemester) {
        return res
          .status(400)
          .json({
            error: `Invalid order for 'nama_semester'. It should be ${
              latestSemester + 1
            }.`,
          });
      }
    } else if (uploadedSemester !== 1) {
      return res
        .status(400)
        .json({
          error: `Invalid order for 'nama_semester'. It should be 1 as it's the first entry.`,
        });
    }

    // Share data ke all mapel
    const sharedData = {
      nama_semester,
      kode_tahun_ajaran,
      id_siswa,
      id_guru,
      id_kelas,
    };

    const createdNilaiMataPelajaran = [];

    let totalHasilAkhir = 0;
    let totalHasilAkhirPure = 0; // Tanpa dikalikan bobot
    let totalBobot = 0; // Total bobot dari semua mata pelajaran
    let jumlahNilai = 0;

    for (const mataPelajaran of nilai_mata_pelajaran) {
      const { id_mata_pelajaran, nilai_harian, nilai_semester } = mataPelajaran;

      const mapel = await MaPel.findByPk(id_mata_pelajaran);
      if (!mapel) {
        return res
          .status(400)
          .json({ error: `Mapel with id ${id_mata_pelajaran} not found` });
      }

      const nilaiHarian = nilai_harian * 0.4;
      const nilaiSemester = nilai_semester * 0.6;
      const nilaiAkhir = nilaiHarian + nilaiSemester;

      const newNilaiSiswa = await NilaiSiswa.create({
        ...sharedData,
        id_mata_pelajaran,
        nilai_harian,
        nilai_semester,
        nilai_akhir: nilaiAkhir,
      });

      // Hitung total nilai akhir dan bobot
      totalHasilAkhirPure += nilaiAkhir * mapel.bobot_nilai;
      totalBobot += mapel.bobot_nilai;
      totalHasilAkhir += nilaiAkhir;
      jumlahNilai++;

      createdNilaiMataPelajaran.push(newNilaiSiswa);
    }

    // Hitung bobot nilai akhir
    const bobotNilaiAkhir = totalHasilAkhirPure / totalBobot;
    const totalHasilAkhirPureFormatted = totalHasilAkhir;
    const rataRataNilaiPure = totalHasilAkhir / jumlahNilai;

    // Simpan data ke tabel nilai_akhir
    const createdNilaiAkhir = await NilaiAkhir.create({
      id_siswa: id_siswa,
      id_kelas: id_kelas,
      nama_semester: nama_semester,
      total_hasil_akhir: totalHasilAkhirPureFormatted,
      rata_rata_nilai: rataRataNilaiPure,
      bobot_nilai_akhir: bobotNilaiAkhir,
    });

    return res.status(201).json({
      message: "Nilai Siswa created successfully",
      response: createdNilaiMataPelajaran,
      nilai_akhir_info: {
        ...createdNilaiAkhir.toJSON(),
        total_hasil_akhir: totalHasilAkhirPureFormatted.toFixed(2),
        rata_rata_nilai: rataRataNilaiPure.toFixed(2),
        bobot_nilai_akhir: bobotNilaiAkhir.toFixed(2),
      },
    });
  } catch (error) {
    const errorHandler = errorHandlers[error.name] || handleInternalServerError;
    return errorHandler(error, res);
  }
};


//** UPDATE NILAI SISWA */
export const updateNilaiSiswa = async (req, res) => {
  try {
    const { id_siswa, nama_semester } = req.params;
    const { nilai_mata_pelajaran } = req.body;

    // Check if siswa exists
    const siswa = await Siswa.findByPk(id_siswa);
    if (!siswa) {
      return res.status(400).json({ error: "Siswa not found" });
    }

    // Find existing nilai siswa entries
    const existingNilai = await NilaiSiswa.findAll({ where: { id_siswa } });

    // Update nilai_harian and nilai_semester based on request
    for (const mataPelajaran of nilai_mata_pelajaran) {
      const { id_mata_pelajaran, nilai_harian, nilai_semester } = mataPelajaran;

      const existingData = existingNilai.find(
        (data) => data.id_mata_pelajaran === parseInt(id_mata_pelajaran, 10)
      );

      if (existingData) {
        // Update nilai_harian and nilai_semester
        await NilaiSiswa.update(
          { nilai_harian, nilai_semester },
          {
            where: {
              id_siswa,
              id_mata_pelajaran: existingData.id_mata_pelajaran,
            },
          }
        );
      }
    }

    // Recalculate nilai_akhir for all mata_pelajaran
    const updatedNilai = await NilaiSiswa.findAll({
      where: { id_siswa },
    });

    let totalHasilAkhir = 0;
    let totalHasilAkhirPure = 0; // Tanpa dikalikan bobot
    let totalBobot = 0; // Total bobot dari semua mata pelajaran
    let jumlahNilai = 0;

    for (const mataPelajaran of updatedNilai) {
      const mapel = await MaPel.findByPk(mataPelajaran.id_mata_pelajaran);
      if (!mapel) {
        return res.status(400).json({
          error: `Mapel with id ${mataPelajaran.id_mata_pelajaran} not found`,
        });
      }

      const nilaiAkhir =
        mataPelajaran.nilai_harian * 0.4 + mataPelajaran.nilai_semester * 0.6;

      // Update nilai_akhir
      await NilaiSiswa.update(
        { nilai_akhir: nilaiAkhir },
        {
          where: {
            id_siswa,
            id_mata_pelajaran: mataPelajaran.id_mata_pelajaran,
          },
        }
      );

      // Hitung total nilai akhir dan bobot
      totalHasilAkhirPure += nilaiAkhir * mapel.bobot_nilai;
      totalBobot += mapel.bobot_nilai;
      totalHasilAkhir += nilaiAkhir;
      jumlahNilai++;
    }

    // Hitung bobot nilai akhir
    const bobotNilaiAkhir = totalHasilAkhirPure / totalBobot;
    const totalHasilAkhirPureFormatted = totalHasilAkhir;
    const rataRataNilaiPure = totalHasilAkhir / jumlahNilai;

    // Update data ke tabel nilai_akhir
    await NilaiAkhir.update(
      {
        total_hasil_akhir: totalHasilAkhirPureFormatted,
        rata_rata_nilai: rataRataNilaiPure,
        bobot_nilai_akhir: bobotNilaiAkhir,
      },
      {
        where: { id_siswa },
      }
    );

    return res.status(200).json({
      message: "Nilai Siswa updated successfully",
      updatedNilai,
      nilai_akhir_info: {
        total_hasil_akhir: totalHasilAkhirPureFormatted.toFixed(2),
        rata_rata_nilai: rataRataNilaiPure.toFixed(2),
        bobot_nilai_akhir: bobotNilaiAkhir.toFixed(2),
      },
    });
  } catch (error) {
    const errorHandler = errorHandlers[error.name] || handleInternalServerError;
    return errorHandler(error, res);
  }
};
