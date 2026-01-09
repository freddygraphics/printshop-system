// /app/api/invoices/[id]/send-to-me/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Client, Environment } from "square";

const prisma = new PrismaClient();

export async function POST(req, { params }) {
  try {
    const id = Number(params.id);

    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // 🔵 Square Sandbox
    const square = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment: Environment.Sandbox, 
    });

    const locationId = process.env.SQUARE_LOCATION_ID;

    // 🔵 Create Payment Link
    const response = await square.checkoutApi.createPaymentLink({
      idempotencyKey: crypto.randomUUID(),
      order: {
        locationId,
        lineItems: [
          {
            name: `Invoice #${invoice.id}`,
            quantity: "1",
            basePriceMoney: {
              amount: Math.round(invoice.total * 100),
              currency: "USD",
            },
          },
        ],
      },
      checkoutOptions: {
        redirectUrl: process.env.PAYMENT_RETURN_URL,
      },
    });

    const paymentLink = response.result.paymentLink?.url;

    if (!paymentLink) {
      return NextResponse.json(
        { error: "Failed to generate payment link" },
        { status: 500 }
      );
    }

    // Save payment link
    await prisma.invoice.update({
      where: { id },
      data: { paymentLink },
    });

    // 🔵 Create WhatsApp link
    const phone = process.env.MY_PHONE_NUMBER.replace("+", "");
    const message = encodeURIComponent(
      `Here is your payment link for Invoice #${invoice.id}:\n\n${paymentLink}`
    );

    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;

    return NextResponse.json(
      {
        success: true,
        link: paymentLink,
        whatsapp: whatsappUrl,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("❌ ERROR send-to-me:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}
