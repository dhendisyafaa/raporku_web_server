import { handleInternalServerError } from "../helpers/handleError/sequelize_error.js";
import Kelas from "../models/kelas_model.js";
import MaPel from "../models/mata_pelajaran.js";
import NilaiAkhir from "../models/nilai_akhir_model.js";
import NilaiSiswa from "../models/nilai_siswa_model.js";
import Siswa from "../models/siswa_model.js";
import TahunAjaran from "../models/tahun_ajaran_model.js";


//** CHART NILAI SISWA */
export const getChartDataByIdSiswa = async (req, res) => {
  try {
    const idSiswa = req.params.id;
    const siswaInfo = await Siswa.findByPk(idSiswa, { attributes: ['nama_lengkap'] });
    if (!siswaInfo) { return res.status(400).json({ error: `ID Siswa ${idSiswa} not found` });}

    const mataPelajaranList = await MaPel.findAll({ attributes: ['id_mata_pelajaran', 'nama_pelajaran'] });

    const nilaiSiswaList = await NilaiSiswa.findAll({ where: { id_siswa: idSiswa }, include: [{ model: MaPel, attributes: ['id_mata_pelajaran', 'nama_pelajaran'] }] });

    const result = mataPelajaranList.map((mata_pelajaran) => ({ mapel: mata_pelajaran.nama_pelajaran }));

    nilaiSiswaList.forEach((nilai) => { const mapelIndex = result.findIndex((item) => item.mapel === (nilai.mata_pelajaran?.nama_pelajaran || null));
      if (mapelIndex !== -1) { result[mapelIndex][`Semester ${nilai.nama_semester}`] = nilai.nilai_akhir || 0; }
    });

    const finalResponse = { id_siswa: idSiswa, nama_lengkap: siswaInfo.nama_lengkap, nilai_siswa: result };
    res.status(200).json(finalResponse);
  } catch (error) {
    handleInternalServerError(error, res);
  }
};


//** CHART ADMIN */
export const getChartDataTahunAjaran = async (req, res) => {
  try {
    const resThn = await TahunAjaran.findAll({ attributes: ['kode_tahun_ajaran', 'jumlah_peserta_didik'] });

    res.status(200).json(resThn?.length ? resThn : { msg: "Tahun Ajaran not available.", data: [] });
  } catch (error) {
    handleInternalServerError(error, res);
  }
};


//** RANGKIN SISWA */
export const getRankingByKelasId = async (req, res) => {
  try {
    const idKelas = req.params.id;
    const targetSemester = req.query.nama_semester;
    if (targetSemester !== null && (isNaN(targetSemester) || targetSemester < 1 || targetSemester > 6)) {
      return res.status(400).json({ error: "Invalid semester value. Semester must be between 1 and 6." });
    }

    const kelasInfo = await Kelas.findByPk(idKelas, { include: [{ model: Siswa, as: 'daftar_siswa', attributes: ['id_siswa', 'nama_lengkap', 'kode_tahun_ajaran'] }] });
    if (!kelasInfo) { return res.status(404).json({ error: `Kelas with ID ${idKelas} not found` });}

    let nilaiAkhirList = [];

    if (targetSemester) {
      nilaiAkhirList = await NilaiAkhir.findAll({
        where: {
          id_siswa: kelasInfo.daftar_siswa.map((siswa) => siswa.id_siswa),
          nama_semester: targetSemester,
        },
      });
    } else {
      nilaiAkhirList = await NilaiAkhir.findAll({
        where: {
          id_siswa: kelasInfo.daftar_siswa.map((siswa) => siswa.id_siswa),
        },
      });
    }

    nilaiAkhirList.sort((a, b) => b.bobot_nilai_akhir - a.bobot_nilai_akhir);

    const slicedNilaiAkhirList = nilaiAkhirList.slice(0, 10);

    const formattedResponse = {
      nama_semester: targetSemester,
      kelas: {
        id_kelas: kelasInfo.id_kelas,
        nama_kelas: kelasInfo.nama_kelas,
      },
      siswa: slicedNilaiAkhirList.map((nilaiSiswa) => {
        const siswa = kelasInfo.daftar_siswa.find((siswa) => siswa.id_siswa === nilaiSiswa.id_siswa);

        return {
          id_siswa: siswa.id_siswa,
          nama_lengkap: siswa.nama_lengkap,
          kode_tahun_ajaran: siswa.kode_tahun_ajaran,
          bobot_nilai_akhir: nilaiSiswa.bobot_nilai_akhir,
        };
      }),
    };

    res.status(200).json(formattedResponse);
  } catch (error) {
    handleInternalServerError(error, res);
  }
};


//** CHART NILAI SISWA IN GURU */
export const getTotalNilaiAkhirByKelasId = async (req, res) => {
  try {
    const idKelas = req.params.id;
    const kelasData = await Kelas.findByPk(idKelas);
    if (!kelasData) { return res.status(404).json({ message: `ID Kelas ${idKelas} not found` }); }

    const dataByIdKelas = await NilaiAkhir.findAll({ where: { id_kelas: idKelas } });

    const totalBobot = {};
    const jumlahSemester = {};

    dataByIdKelas.forEach((data) => {
      const { nama_semester, bobot_nilai_akhir } = data;
      totalBobot[nama_semester] = (totalBobot[nama_semester] || 0) + bobot_nilai_akhir;
      jumlahSemester[nama_semester] = (jumlahSemester[nama_semester] || 0) + 1;
    });

    const rataRataBobot = {};
    for (const semester in totalBobot) {
      rataRataBobot[semester] = totalBobot[semester] / jumlahSemester[semester];
    }

    const response = {
      id_kelas: idKelas,
      nama_kelas: kelasData.nama_kelas,
      data: Object.keys(rataRataBobot).map((semester) => ({
        semester,
        total_rata_rata_bobot_nilai_akhir: rataRataBobot[semester],
      })),
    };

    res.status(200).json(response);
  } catch (error) {
    handleInternalServerError(error, res);
  }
};
