const express = require("express")
const router = express.Router()
const auth = require("../middlewares/auth.middleware")
const elpijiController = require("../controllers/elpiji.controller")

router.get("/", auth, elpijiController.getAll)
router.post("/", auth, elpijiController.create)
router.put("/:id", auth, elpijiController.update)
router.delete("/:id", auth, elpijiController.remove)
router.get("/export", auth, elpijiController.exportExcel)

module.exports = router
