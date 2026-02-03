const db = require("../config/db")
const { success, error } = require("../utils/response")

// GET ALL TRANSAKSI
exports.getAll = async (req, res) => {
  const search = req.query.search || ""

  const whereClause = search
    ? `WHERE 
        pangkalan LIKE ? 
        OR pemilik LIKE ? 
        OR nama_driver LIKE ? 
        OR status LIKE ?`
    : ""

  const params = search
    ? [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`]
    : []

  const [rows] = await db.query(
    `
    SELECT *
    FROM transaksi
    ${whereClause}
    ORDER BY tanggal DESC, created_at DESC
    `,
    params
  )

  return success(res, { data: rows })
}

exports.create = async (req, res) => {
  const conn = await db.getConnection()

  try {
    const {
      elpiji_id,
      pangkalan,
      pemilik,
      nomor,
      alamat,
      nama_driver,
      tanggal,
      lpg_3kg,
      lpg_12kg,
    } = req.body

    if (
      !elpiji_id ||
      !pangkalan ||
      !pemilik ||
      !nama_driver ||
      !tanggal
    ) {
      return error(res, "Data wajib belum lengkap")
    }

    await conn.beginTransaction()

    if (lpg_3kg > 0) {
      const [[stok3kg]] = await conn.query(
        `SELECT IFNULL(jumlah,0) AS jumlah FROM storage WHERE nama = 'lpg 3kg' FOR UPDATE`
      )

      if (!stok3kg || stok3kg.jumlah < lpg_3kg) {
        await conn.rollback()
        return error(
          res,
          `Stok LPG 3kg tidak mencukupi (tersedia: ${stok3kg?.jumlah ?? 0})`
        )
      }
    }

    if (lpg_12kg > 0) {
      const [[stok12kg]] = await conn.query(
        `SELECT IFNULL(jumlah,0) AS jumlah FROM storage WHERE nama = 'lpg 12kg' FOR UPDATE`
      )

      if (!stok12kg || stok12kg.jumlah < lpg_12kg) {
        await conn.rollback()
        return error(
          res,
          `Stok LPG 12kg tidak mencukupi (tersedia: ${stok12kg?.jumlah ?? 0})`
        )
      }
    }

    await conn.query(
      `
      INSERT INTO transaksi (
        elpiji_id,
        pangkalan,
        pemilik,
        nomor,
        alamat,
        nama_driver,
        tanggal,
        lpg_3kg,
        lpg_12kg,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Waiting')
      `,
      [
        elpiji_id,
        pangkalan,
        pemilik,
        nomor,
        alamat,
        nama_driver,
        tanggal,
        lpg_3kg || 0,
        lpg_12kg || 0,
      ]
    )

    if (lpg_3kg > 0) {
      await conn.query(
        `UPDATE storage SET jumlah = jumlah - ? WHERE nama = 'lpg 3kg'`,
        [lpg_3kg]
      )
    }

    if (lpg_12kg > 0) {
      await conn.query(
        `UPDATE storage SET jumlah = jumlah - ? WHERE nama = 'lpg 12kg'`,
        [lpg_12kg]
      )
    }

    await conn.commit()
    return success(res, null, "Transaksi berhasil dibuat (Waiting)")
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

exports.getByElpijiId = async (req, res) => {
  const { elpijiId } = req.params

  const [[elpiji]] = await db.query(
    `SELECT * FROM elpiji WHERE id = ?`,
    [elpijiId]
  )

  if (!elpiji) {
    return error(res, "Data elpiji tidak ditemukan")
  }

  return success(res, { data: elpiji })
}

exports.update = async (req, res) => {
  const { id } = req.params
  const {
    pangkalan,
    pemilik,
    nomor,
    alamat,
    nama_driver,
    tanggal,
    lpg_3kg,
    lpg_12kg,
  } = req.body

  await db.query(
    `
    UPDATE transaksi SET
      pangkalan = ?,
      pemilik = ?,
      nomor = ?,
      alamat = ?,
      nama_driver = ?,
      tanggal = ?,
      lpg_3kg = ?,
      lpg_12kg = ?
    WHERE id = ?
    `,
    [
      pangkalan,
      pemilik,
      nomor,
      alamat,
      nama_driver,
      tanggal,
      lpg_3kg,
      lpg_12kg,
      id,
    ]
  )

  return success(res, null, "Transaksi berhasil diperbarui")
}

exports.complete = async (req, res) => {
  const conn = await db.getConnection()
  const { id } = req.params

  try {
    await conn.beginTransaction()

    const [[trx]] = await conn.query(
      `SELECT * FROM transaksi WHERE id = ? FOR UPDATE`,
      [id]
    )

    if (!trx) return error(res, "Transaksi tidak ditemukan")
    if (trx.status === "Completed")
      return error(res, "Transaksi sudah completed")

    await conn.query(
      `UPDATE transaksi SET status = 'Completed' WHERE id = ?`,
      [id]
    )

    if (trx.lpg_3kg > 0) {
      await conn.query(
        `UPDATE storage SET jumlah = IFNULL(jumlah,0) + ? WHERE nama = 'lpg 3kg'`,
        [trx.lpg_3kg]
      )
    }

    if (trx.lpg_12kg > 0) {
      await conn.query(
        `UPDATE storage SET jumlah = IFNULL(jumlah,0) + ? WHERE nama = 'lpg 12kg'`,
        [trx.lpg_12kg]
      )
    }

    await conn.commit()
    return success(res, null, "Transaksi berhasil diselesaikan")
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

exports.remove = async (req, res) => {
  await db.query(
    `DELETE FROM transaksi WHERE id = ?`,
    [req.params.id]
  )
  return success(res, null, "Transaksi berhasil dihapus")
}
