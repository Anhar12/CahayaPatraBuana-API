const db = require("../config/db")
const { success, error } = require("../utils/response")

// GET ALL STORAGE
exports.getAll = async (req, res) => {
  const [rows] = await db.query(
    `
    SELECT id, nama, jumlah
    FROM storage
    ORDER BY nama ASC
    `
  )

  return success(res, { data: rows })
}

// UPDATE JUMLAH STORAGE
exports.update = async (req, res) => {
  const { id } = req.params
  const { jumlah } = req.body

  if (jumlah === undefined || jumlah < 0) {
    return error(res, "Jumlah tidak valid")
  }

  const [result] = await db.query(
    `
    UPDATE storage
    SET jumlah = ?
    WHERE id = ?
    `,
    [jumlah, id]
  )

  if (result.affectedRows === 0) {
    return error(res, "Data storage tidak ditemukan")
  }

  return success(res, null, "Jumlah storage berhasil diperbarui")
}
