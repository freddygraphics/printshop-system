import prisma from "../lib/db.js";
import { generateInvoiceToken } from "../lib/qrToken.js";

async function run() {
  console.log("🔁 Regenerating QR tokens...");

  const invoices = await prisma.invoice.findMany();

  for (const inv of invoices) {
    const qrToken = generateInvoiceToken(inv.id);

    await prisma.invoice.update({
      where: { id: inv.id },
      data: {
        qrToken,
        qrGeneratedAt: new Date(),
      },
    });
  }

  console.log("✅ QR tokens regenerated successfully");
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Error regenerating QR tokens:", err);
  process.exit(1);
});
