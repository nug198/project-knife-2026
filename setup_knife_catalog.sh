#!/bin/bash

# ============================================================
# PostgreSQL Database Setup Script for Knife Catalog
# ============================================================

DB_NAME="knife_catalog"
DB_USER=$(whoami)

echo "🚀 Starting PostgreSQL setup for database: $DB_NAME"
echo "---------------------------------------------"

# 1️⃣ Cek apakah database sudah ada
if psql -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  echo "✅ Database '$DB_NAME' already exists, skipping creation."
else
  echo "🆕 Creating database '$DB_NAME'..."
  createdb -U "$DB_USER" "$DB_NAME"
fi

# 2️⃣ Jalankan semua perintah SQL
psql -U "$DB_USER" -d "$DB_NAME" <<'SQL'
-- ============================================================
-- SCHEMA SETUP
-- ============================================================

CREATE TABLE IF NOT EXISTS "user" (
  id_user SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nama VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('admin','editor')) DEFAULT 'admin',
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kategori (
  id_kategori SERIAL PRIMARY KEY,
  nama_kategori VARCHAR(100) NOT NULL,
  slug VARCHAR(150) UNIQUE,
  deskripsi TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maker (
  id_maker SERIAL PRIMARY KEY,
  nama_maker VARCHAR(150) NOT NULL,
  profil TEXT,
  lokasi VARCHAR(100),
  kontak VARCHAR(100),
  foto_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gambar_produk (
  id_gambar SERIAL PRIMARY KEY,
  id_produk INT,
  gambar VARCHAR(255) NOT NULL,
  url_gambar VARCHAR(255),
  keterangan VARCHAR(255),
  urutan INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS produk (
  id_produk SERIAL PRIMARY KEY,
  nama_produk VARCHAR(200) NOT NULL,
  slug VARCHAR(150) UNIQUE,
  harga NUMERIC(12,2) DEFAULT 0,
  id_kategori INT,
  id_maker INT,
  deskripsi_singkat VARCHAR(255),
  deskripsi_lengkap TEXT,
  bahan_bilah VARCHAR(100),
  bahan_gagang VARCHAR(100),
  bahan_sarung VARCHAR(100),
  panjang_bilah NUMERIC(5,2),
  lebar_bilah NUMERIC(5,2),
  tebal_bilah NUMERIC(5,2),
  berat NUMERIC(6,2),
  id_gambar INT,
  video_demo VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status_tampil BOOLEAN DEFAULT FALSE,
  rating NUMERIC(2,1),
  CONSTRAINT fk_kategori FOREIGN KEY (id_kategori) REFERENCES kategori(id_kategori) ON DELETE SET NULL,
  CONSTRAINT fk_maker FOREIGN KEY (id_maker) REFERENCES maker(id_maker) ON DELETE SET NULL,
  CONSTRAINT fk_gambar FOREIGN KEY (id_gambar) REFERENCES gambar_produk(id_gambar) ON DELETE SET NULL
);

ALTER TABLE gambar_produk
ADD CONSTRAINT fk_produk FOREIGN KEY (id_produk) REFERENCES produk(id_produk) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS artikel (
  id_artikel SERIAL PRIMARY KEY,
  judul VARCHAR(200) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  isi TEXT,
  gambar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_user INT,
  url_sumber VARCHAR(255),
  CONSTRAINT fk_user FOREIGN KEY (id_user) REFERENCES "user"(id_user) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tema (
  id_tema SERIAL PRIMARY KEY,
  nama_tema VARCHAR(100) DEFAULT 'Default Green',
  warna_primary VARCHAR(20) DEFAULT '#1f513f',
  warna_aksen VARCHAR(20) DEFAULT '#3bbf79',
  warna_teks VARCHAR(20) DEFAULT '#ffffff',
  logo_url VARCHAR(255),
  aktif BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu (
  id_menu SERIAL PRIMARY KEY,
  nama_menu VARCHAR(100) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  urutan INT DEFAULT 0,
  aktif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TRIGGER untuk update otomatis kolom updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tambahkan trigger untuk tabel yang punya kolom updated_at
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT table_name FROM information_schema.columns
    WHERE column_name = 'updated_at' AND table_schema = 'public'
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
      tbl, tbl
    );
  END LOOP;
END;
$$;
SQL

echo "✅ Setup complete! Database '$DB_NAME' is ready."

