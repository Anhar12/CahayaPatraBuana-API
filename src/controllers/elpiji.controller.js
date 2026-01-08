const db = require("../config/db")
const { success, error } = require("../utils/response")

exports.getAll = async (req, res) => {
  const search = req.query.search || ""

  const whereClause = search
    ? `WHERE e.pangkalan LIKE ? OR e.pemilik LIKE ? OR e.alamat LIKE ?`
    : ""

  const searchParams = search
    ? [`%${search}%`, `%${search}%`, `%${search}%`]
    : []

  const [rows] = await db.query(
    `
    SELECT e.*, u.username
    FROM elpiji e
    JOIN users u ON u.id = e.user_id
    ${whereClause}
    ORDER BY e.created_at DESC
    `,
    searchParams
  )

  return success(res, {
    data: rows,
  })
}

exports.create = async (req, res) => {
  const {
    pangkalan,
    pemilik,
    nomor,
    alamat,
    elpiji_3kg,
    elpiji_12kg,
  } = req.body

  if (!pangkalan || !pemilik) {
    return error(res, "Pangkalan dan Pemilik wajib diisi")
  }

  await db.query(
    `
    INSERT INTO elpiji
    (pangkalan, pemilik, nomor, alamat, elpiji_3kg, elpiji_12kg, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      pangkalan,
      pemilik,
      nomor,
      alamat,
      elpiji_3kg || 0,
      elpiji_12kg || 0,
      req.user.id,
    ]
  )

  return success(res, null, "Data elpiji berhasil ditambahkan")
}

exports.update = async (req, res) => {
  const { id } = req.params

  await db.query(
    `
    UPDATE elpiji
    SET pangkalan=?, pemilik=?, nomor=?, alamat=?, elpiji_3kg=?, elpiji_12kg=?
    WHERE id=?
    `,
    [
      req.body.pangkalan,
      req.body.pemilik,
      req.body.nomor,
      req.body.alamat,
      req.body.elpiji_3kg,
      req.body.elpiji_12kg,
      id,
    ]
  )

  return success(res, null, "Data elpiji berhasil diperbarui")
}

exports.remove = async (req, res) => {
  await db.query("DELETE FROM elpiji WHERE id = ?", [req.params.id])
  return success(res, null, "Data elpiji berhasil dihapus")
}
