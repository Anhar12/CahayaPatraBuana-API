const express = require("express")
const router = express.Router()
const auth = require("../middlewares/auth.middleware")
const transaksiController = require("../controllers/transaksi.controller")

router.get("/", auth, transaksiController.getAll)
router.get("/elpiji/:elpijiId", auth, transaksiController.getByElpijiId)
router.post("/", auth, transaksiController.create)
router.put("/:id", auth, transaksiController.update)
router.put("/:id/complete", auth, transaksiController.complete)
router.delete("/:id", auth, transaksiController.remove)

module.exports = router
