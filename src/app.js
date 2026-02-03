const express = require("express")
const cors = require("cors")

const authRoutes = require("./routes/auth.routes")
const elpijiRoutes = require("./routes/elpiji.routes")
const transaksiRoutes = require("./routes/transaksi.routes")
const storageRoutes = require("./routes/storage.routes")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/elpiji", elpijiRoutes)
app.use("/api/storage", storageRoutes)
app.use("/api/transaksi", transaksiRoutes)

app.get("/", (req, res) => {
  res.send("API CPB running")
})

module.exports = app
