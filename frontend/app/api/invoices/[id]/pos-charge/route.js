// /app/api/invoices/[id]/pos-charge/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req, { params }) {
  try {
    const id = Number(params.id);
    if (!id) {
      return NextResponse.json(
        { error: "Invalid invoice ID" },
        { status: 400 }
      );
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id }
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // ----------------------------------------------
    // SQUARE POS REQUEST (ESTO ES LO IMPORTANTE)
    // ----------------------------------------------
    const data = {
      amount_money: {
        amount: Math.round(invoice.total * 100), // en centavos
        currency_code: "USD"
      },
      callback_url: `${process.env.PAYMENT_RETURN_URL}?invoice=${invoice.id}`,
      client_id: process.env.SQUARE_APPLICATION_ID,
      note: `Invoice #${invoice.id} – Freddy Graphics LLC`,
      options: {
        supported_tender_types: ["CARD", "CASH", "OTHER"]
      }
    };

    const encoded = encodeURIComponent(JSON.stringify(data));

    // Link universal para abrir Square POS App
    const posLink = `square-commerce-v1://charge?data=${encoded}`;

    return NextResponse.json(
      { success: true, url: posLink },
      { status: 200 }
    );

  } catch (error) {
    console.log("❌ POS ERROR:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}
