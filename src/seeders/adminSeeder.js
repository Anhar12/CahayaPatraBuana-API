import bcrypt from "bcrypt"
import { db } from "../config/db.js"

export async function seedAdminIfEmpty() {
  try {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM users")

    if (rows[0].total > 0) {
      console.log("Users table already has data. Skip seeding.")
      return
    }

    const hashedPassword = await bcrypt.hash("123", 10)

    await db.query(
      `
      INSERT INTO users (full_name, email, password, role)
      VALUES (?, ?, ?, ?)
      `,
      [
        "Administrator",
        "admin",
        hashedPassword,
        "super_admin",
      ]
    )

    console.log("Default admin user created.")
  } catch (error) {
    console.error("Admin seeder failed:", error)
  }
}
