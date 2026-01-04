const db = require("../config/db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { success, error } = require("../utils/response")

exports.login = async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return error(res, "Username dan password wajib diisi", 400)
  }

  const [rows] = await db.query(
    "SELECT * FROM users WHERE username = ?",
    [username]
  )

  if (!rows.length) {
    return error(res, "Username atau password salah!", 401)
  }

  const user = rows[0]
  const match = await bcrypt.compare(password, user.password)

  if (!match) {
    return error(res, "Username atau password salah!", 401)
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  )

  return success(res, { token })
}
