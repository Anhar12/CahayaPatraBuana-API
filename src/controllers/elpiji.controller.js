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

exports.exportExcel = async (req, res) => {
  const search = req.query.search || ""

  const whereClause = search
    ? `WHERE 
        pangkalan LIKE ? 
        OR pemilik LIKE ? 
      `
    : ""

  const params = search
    ? [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`]
    : []

  const [rows] = await db.query(
    `
    SELECT
      pangkalan,
      pemilik,
      nomor,
      alamat,
      lpg_3kg,
      lpg_12kg,
      created_at
    FROM elpiji
    ${whereClause}
    ORDER BY created_at DESC
    `,
    params
  )

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("Pangkalan")

  worksheet.columns = [
    { header: "Pangkalan", key: "pangkalan", width: 20 },
    { header: "Pemilik", key: "pemilik", width: 20 },
    { header: "Nomor", key: "nomor", width: 15 },
    { header: "Alamat", key: "alamat", width: 30 },
    { header: "LPG 3 KG", key: "lpg_3kg", width: 12 },
    { header: "LPG 12 KG", key: "lpg_12kg", width: 14 },
    { header: "Status", key: "status", width: 12 },
    { header: "Created At", key: "created_at", width: 20 },
  ]

  worksheet.getRow(1).font = { bold: true }
  worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" }

  rows.forEach((row) => {
    worksheet.addRow({
      ...row,
      tanggal: row.tanggal
        ? new Date(row.tanggal).toISOString().split("T")[0]
        : "",
      created_at: row.created_at
        ? new Date(row.created_at)
        : "",
    })
  })

  worksheet.getColumn("created_at").numFmt = "dd-mm-yyyy hh:mm:ss"

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  )
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=pangkalan.xlsx"
  )

  await workbook.xlsx.write(res)
  res.end()
}