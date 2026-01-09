import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyInvoiceToken } from "@/lib/qrToken";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
  const session = await getServerSession(authOptions);

  // 🔒 SOLO USUARIOS LOGUEADOS
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const invoiceId = verifyInvoiceToken(token);
  if (!invoiceId) {
    return NextResponse.json({ error: "Invalid QR" }, { status: 400 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  // 👉 REDIRIGE AL SISTEMA
  return NextResponse.redirect(new URL(`/invoices/${invoice.id}`, req.url));
}
