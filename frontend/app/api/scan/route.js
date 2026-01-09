import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { decodeInvoiceToken } from "@/lib/qrToken";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = new URL(req.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Invalid QR" }, { status: 400 });
  }

  try {
    const invoiceId = decodeInvoiceToken(token);

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invalid QR" }, { status: 404 });
    }

    return NextResponse.json({ invoiceId });
  } catch {
    return NextResponse.json({ error: "Invalid QR" }, { status: 400 });
  }
}
