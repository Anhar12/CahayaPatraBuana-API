const db = require("./db")
const bcrypt = require("bcrypt")

async function initDb() {
  const conn = await db.getConnection()

  try {
    // USERS TABLE
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // ELPIJI TABLE
    await conn.query(`
      CREATE TABLE IF NOT EXISTS elpiji (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pangkalan VARCHAR(100) NOT NULL,
        pemilik VARCHAR(100) NOT NULL,
        nomor VARCHAR(20),
        alamat VARCHAR(255),
        elpiji_3kg INT DEFAULT 0,
        elpiji_12kg INT DEFAULT 0,
        user_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // TRANSAKSI TABLE
    await conn.query(`
      CREATE TABLE IF NOT EXISTS transaksi (
        id INT AUTO_INCREMENT PRIMARY KEY,
        elpiji_id INT NOT NULL,

        pangkalan VARCHAR(100) NOT NULL,
        pemilik VARCHAR(100) NOT NULL,
        nomor VARCHAR(20),
        alamat VARCHAR(255),
        nama_driver VARCHAR(100) NOT NULL,
        tanggal DATE NOT NULL,
        lpg_3kg INT DEFAULT 0,
        lpg_12kg INT DEFAULT 0,
        status ENUM('Waiting', 'Completed') NOT NULL,

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // STORAGE TABLE
    await conn.query(`
      CREATE TABLE IF NOT EXISTS storage (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama VARCHAR(50) NOT NULL UNIQUE,
        jumlah INT NULL
      )
    `)

    // SEED ADMIN (JIKA USERS KOSONG)
    const [[{ total }]] = await conn.query(
      "SELECT COUNT(*) AS total FROM users"
    )

    if (total === 0) {
      const hashed = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD, 10)
      await conn.query(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        ["admin", hashed]
      )
      console.log("✔ Default admin created")
    }

    // SEED STORAGE DATA (JIKA KOSONG)
    const [[{ total: storageTotal }]] = await conn.query(
      "SELECT COUNT(*) AS total FROM storage"
    )

    if (storageTotal === 0) {
      await conn.query(`
        INSERT INTO storage (nama, jumlah) VALUES
        ('Truck', 4),
        ('Pick Up', 1),
        ('LPG 3kg', 2800),
        ('LPG 12kg', 118)
      `)
      console.log("✔ Default storage data created")
    }

    console.log("✔ Database initialized")
  } finally {
    conn.release()
  }
}

module.exports = initDb