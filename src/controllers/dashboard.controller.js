const db = require("../config/db")
const { success } = require("../utils/response")

exports.stats = async (req, res) => {
  const [[stats]] = await db.query(`
    SELECT
      COUNT(*) AS total_data,
      SUM(elpiji_3kg) + SUM(elpiji_12kg) AS total_elpiji,
      SUM(elpiji_3kg) AS total_3kg,
      SUM(elpiji_12kg) AS total_12kg
    FROM elpiji
  `)

  return success(res, stats)
}
