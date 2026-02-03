const express = require("express")
const router = express.Router()
const auth = require("../middlewares/auth.middleware")
const storageController = require("../controllers/storage.controller")

router.get("/", auth, storageController.getAll)
router.put("/:id", auth, storageController.update)

module.exports = router
