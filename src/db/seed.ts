// src/db/seed.ts
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "nextGen",
});

async function main() {
  const client = await pool.connect();

  try {
    console.log("🌱 Seeding database for Lahore Metro...");

    // Clean tables in order (respecting FKs)
    await client.query(`DELETE FROM "trips"`);
    await client.query(`DELETE FROM "routes"`);
    await client.query(`DELETE FROM "fares"`);
    await client.query(`DELETE FROM "users"`);

    // ─────────────────────────────────────────────
    // Admin user
    // ─────────────────────────────────────────────
    const adminPassword = await bcrypt.hash("Admin@123", 10);
    await client.query(
      `INSERT INTO "users" (name, email, phone, password_hash, role, balance)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ["Super Admin", "admin@next.gen", "03001234567", adminPassword, "admin", 0]
    );

    // ─────────────────────────────────────────────
    // Sample users
    // ─────────────────────────────────────────────
    const userPassword = await bcrypt.hash("Password123", 10);
    const sampleUsers = [
      ["Ali Raza", "ali@example.com", "03001112222", 200],
      ["Sara Khan", "sara@example.com", "03003334444", 100],
      ["Ahmed Iqbal", "ahmed@example.com", "03005556666", 500],
    ];
    for (const [name, email, phone, balance] of sampleUsers) {
      await client.query(
        `INSERT INTO "users" (name, email, phone, password_hash, role, balance)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [name, email, phone, userPassword, "user", balance]
      );
    }

    // ─────────────────────────────────────────────
    // Fares
    // ─────────────────────────────────────────────
    await client.query(
      `INSERT INTO "fares" (service, price) VALUES
       ('Orange', 40),
       ('Metro', 30),
       ('Speedo', 20)`
    );

    // ─────────────────────────────────────────────
    // Orange Line routes (Ali Town → Dera Gujran)
    // ─────────────────────────────────────────────
    const orangeStations = [
      "Ali Town",
      "Thokar Niaz Baig",
      "Canal View",
      "Hanjarwal",
      "Wahdat Road",
      "Awan Town",
      "Sabzazar",
      "Shahnoor",
      "Salahuddin Road",
      "Bund Road",
      "Samanabad",
      "Gulshan-e-Ravi",
      "Chauburji",
      "Lake Road",
      "GPO",
      "Lakshmi",
      "Railway Station",
      "Sultanpura",
      "UET",
      "Shalimar Garden",
      "Pakistan Mint",
      "Mahmood Booti",
      "Salamatpura",
      "Islam Park",
      "Dera Gujran",
    ];
    for (let i = 0; i < orangeStations.length - 1; i++) {
      await client.query(
        `INSERT INTO "routes" (name, service, start, "end", start_city, end_city)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          `Orange Line Segment ${i + 1}`,
          "Orange",
          orangeStations[i],
          orangeStations[i + 1],
          "Lahore",
          "Lahore",
        ]
      );
    }

    // ─────────────────────────────────────────────
    // Metro Bus routes (Shahdara → Gajju Mata)
    // ─────────────────────────────────────────────
    const metroStations = [
      "Shahdara",
      "Niazi Chowk",
      "Azadi Chowk",
      "Bhatti Chowk",
      "Timber Market",
      "Shama",
      "Qartaba Chowk",
      "MAO College",
      "Janazgah",
      "Civil Secretariat",
      "Punjab Assembly",
      "Shuhada",
      "Qaddafi Stadium",
      "Ichhra",
      "Ferozepur Road",
      "Model Town",
      "Ittefaq Hospital",
      "Kot Lakhpat",
      "Chungi Amar Sidhu",
      "Gajju Mata",
    ];
    for (let i = 0; i < metroStations.length - 1; i++) {
      await client.query(
        `INSERT INTO "routes" (name, service, start, "end", start_city, end_city)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          `Metro Bus Segment ${i + 1}`,
          "Metro",
          metroStations[i],
          metroStations[i + 1],
          "Lahore",
          "Lahore",
        ]
      );
    }

    // ─────────────────────────────────────────────
    // Speedo Feeder Bus sample routes
    // ─────────────────────────────────────────────
    const speedoRoutes = [
      ["Speedo Route 1", "Railway Station", "Shahdara"],
      ["Speedo Route 2", "Canal", "Allama Iqbal Town"],
      ["Speedo Route 3", "R.A. Bazaar", "Chungi Amar Sidhu"],
      ["Speedo Route 4", "Bahria Town", "Thokar"],
    ];
    for (const [name, start, end] of speedoRoutes) {
      await client.query(
        `INSERT INTO "routes" (name, service, start, "end", start_city, end_city)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [name, "Speedo", start, end, "Lahore", "Lahore"]
      );
    }

    console.log("✅ Seed completed successfully");
  } catch (err) {
    console.error("❌ Seed failed:", err);
  } finally {
    client.release();
    await pool.end();
    process.exit(0);
  }
}

main();
