import { NextResponse } from "next/server";
import QRCode from "qrcode";

export async function POST(req, { params }) {
  try {
    const id = params.id;

    // URL final a la pantalla de pago en iPhone
    const tapUrl = `${process.env.PUBLIC_URL}/invoices/${id}/tap`;

    // Crear QR base64
    const qr = await QRCode.toDataURL(tapUrl);

    return NextResponse.json(
      {
        success: true,
        qr,
        url: tapUrl
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "QR generation error" },
      { status: 500 }
    );
  }
}
