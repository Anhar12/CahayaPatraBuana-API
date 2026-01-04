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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_elpiji_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON UPDATE CASCADE
          ON DELETE RESTRICT
      )
    `)

    // SEED ADMIN (JIKA KOSONG)
    const [[{ total }]] = await conn.query(
      "SELECT COUNT(*) AS total FROM users"
    )

    if (total === 0) {
      const hashed = await bcrypt.hash("123", 10)
      await conn.query(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        ["admin", hashed]
      )
      console.log("✔ Default admin created (admin / 123)")
    }

    console.log("✔ Database initialized")
  } finally {
    conn.release()
  }
}

module.exports = initDb