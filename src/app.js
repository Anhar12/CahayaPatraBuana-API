const express = require("express")
const cors = require("cors")

const authRoutes = require("./routes/auth.routes")
const elpijiRoutes = require("./routes/elpiji.routes")
const dashboardRoutes = require("./routes/dashboard.routes")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/elpiji", elpijiRoutes)
app.use("/api/dashboard", dashboardRoutes)

app.get("/", (req, res) => {
  res.send("API CPB running")
})

module.exports = app
