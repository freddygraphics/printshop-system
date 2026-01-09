import fs from "fs";
import csv from "csv-parser";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function importClients() {
  const results = [];

  fs.createReadStream("clients.csv")
    .pipe(csv())
    .on("data", (row) => results.push(row))
    .on("end", async () => {
      console.log(`📦 Importando ${results.length} clientes...`);

      for (const r of results) {
        try {
          await prisma.client.create({
            data: {
              name: r.name,
              company: r.company || null,
              email: r.email,
              phone: r.phone || null,
              address: r.address || null,
            },
          });
          console.log(`✅ ${r.name} agregado`);
        } catch (err) {
          console.error(`⚠️ Error con ${r.name}: ${err.message}`);
        }
      }

      console.log("🎉 Importación finalizada!");
      process.exit();
    });
}

importClients();
