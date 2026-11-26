# Simulasi CAT Tes Potensi Psikologi (TPP) & Profiling — PKN STAN (6 Paket Lintas Sumber PEEPL & TPP)

Aplikasi web simulasi **Computer Assisted Test (CAT) Tes Potensi Psikologi & Profiling** yang meniru alur, tampilan, dan format soal asli platform **peepl.tech (PEEPL TPP 2026)** untuk persiapan seleksi PKN STAN dengan total durasi efektif **120 menit**.

## Katalog 6 Paket Soal (Total 360 Butir Soal di `src/data/questions.json`)

1. **Kelompok Inti TPP PKN STAN 2026 (`PKT-01` s.d. `PKT-03` — 180 Soal):**
   - `PKT-01`, `PKT-02`, `PKT-03`: Seri A, B, dan C simulasi utama PEEPL TPP 2026 (VCR-S 3 opsi + VGR, NCR-S Grafik & Tabel 6 opsi `A–F` + Analogi Angka NGR, Figural SVG opsi gambar `A–E` + Ability to Learn, Kecermatan Hilang Karakter, serta Kuesioner P2 5 Karakter Bergerak + Kepribadian 1 + SJT).
2. **Kelompok Sumber TPP & Seleksi PEEPL Lainnya (`PKT-04` s.d. `PKT-06` — 180 Soal):**
   - **`PKT-04` — Sumber PEEPL ODP Bank Mandiri 2026 (Nucleus Battery):** VCR-S pembiayaan & perbankan, NCR-S konversi kurs valas multi-tahun (`USD/AUD/SGD` + jebakan `F = Tidak dapat ditentukan`), Perbandingan Kuantitatif `x` dan `y`, Figural SVG & matriks otorisasi kredit berjenjang, serta SJT Kepemimpinan + **Kepribadian 1 (`Setuju / ? / Tidak setuju`)** & **Kepribadian 3 (`Nilai & Sikap: Sangat setuju → Tidak setuju`)**.
   - **`PKT-05` — Sumber PEEPL Magang Bakti & MT BCA 2026 (Smart AC & Rule-Learning):** VCR-S layanan digital & keamanan siber, Silogisme kuantor/kondisional, Deret Angka & Deret Huruf, Hitung Cepat diskon bertingkat & PPN/bunga, Ability to Learn transformasi sandi & pengecualian aturan, serta Kuesioner P2 Karakter Bergerak (termasuk butir terbalik *reverse-scored* & skala kewajaran).
   - **`PKT-06` — Sumber Psikologi SPMB PKN STAN 2025–2026, TPA Kemenkeu & Minat Kerja EPPS:** VCR-S Keuangan Negara tambahan (SBN Ritel & BMN), TPA Instansi (Perbandingan `x` dan `y`, Kerja Bersama, Rata-rata Gabungan, Jarak-Berpapasan), Ketelitian Hitung Cepat Digit Satuan (adaptasi CAT Pauli/Kraepelin), Kuesioner Psikologi PKN STAN (*Resiliensi, Regulasi Emosi, Kesungguhan, Efikasi Diri, Ketekunan*), serta **Tes Faktor Minat Kerja (Forced-Choice Pasangan A vs B gaya EPPS dengan 2 Karakter Bergerak)**.

## Fitur Utama
- **Karakter Orang Bergerak (Animasi Gestur):** Mendukung skala 5 karakter (P2 & P3), skala 3 karakter (Kepribadian 1), dan skala 2 karakter pilihan paksa (EPPS Minat Kerja A vs B) beserta adegan kontekstual bergerak (`PersonalitySceneSVG`).
- **Sistem CAT Dual-Adaptif (`✦`):** Kalibrasi tingkat kesulitan kognitif (Level Sulit HOTS vs Standar) pada Tes Penalaran dan percabangan dinamis pada Tes Potensi Pribadi.
- **Filter Sumber Paket di Lobby:** Tab cepat **Semua (6)**, **Inti TPP (3)**, dan **Sumber Lain (3)**.
- **2 Pilihan Struktur Subtes:** **2 Subtes Resmi PPT (Penalaran 90m + Potensi Pribadi 30m)** atau **5 Subtes Terpisah**.
- **Mode Simulasi Penuh (120 Menit)** & **Mode Latihan Cepat (Timer 1/3 Durasi — 40 Menit)**.

## Cara Menjalankan Aplikasi

```powershell
cd C:\Users\krisn\.gemini\antigravity\scratch\pkn-stan-psikotes-cat
npm.cmd run dev
```

Buka `http://localhost:5173` di browser Anda.
