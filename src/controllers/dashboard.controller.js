const db = require("../config/db")
const { success } = require("../utils/response")

exports.stats = async (req, res) => {
  const [[stats]] = await db.query(`
    SELECT
      COUNT(*) AS total_data,
      CAST(COALESCE(SUM(elpiji_3kg), 0) AS SIGNED) + COALESCE(SUM(elpiji_12kg), 0) AS total_elpiji,
      CAST(COALESCE(SUM(elpiji_3kg), 0) AS SIGNED) AS total_3kg,
      CAST(COALESCE(SUM(elpiji_12kg), 0) AS SIGNED) AS total_12kg,
      4 AS truck,
      1 AS pickup
    FROM elpiji;
  `)

  return success(res, stats)
}
