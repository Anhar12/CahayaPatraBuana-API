const express = require("express")
const router = express.Router()
const auth = require("../middlewares/auth.middleware")
const dashboardController = require("../controllers/dashboard.controller")

router.get("/stats", auth, dashboardController.stats)

module.exports = router
