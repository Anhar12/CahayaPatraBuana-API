const db = require("../config/db")
const { success } = require("../utils/response")

exports.stats = async (req, res) => {
  const [[stats]] = await db.query(`
    SELECT
      COUNT(*) AS total_data,
      COALESCE(SUM(elpiji_3kg), 0) + COALESCE(SUM(elpiji_12kg), 0) AS total_elpiji,
      COALESCE(SUM(elpiji_3kg), 0) AS total_3kg,
      COALESCE(SUM(elpiji_12kg), 0) AS total_12kg
    FROM elpiji;
  `)

  return success(res, stats)
}
