require("dotenv").config()
const app = require("./app")
const initDb = require("./config/initDB")

const PORT = process.env.PORT || 5000

;(async () => {
  await initDb()

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
})()
