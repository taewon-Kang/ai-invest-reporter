import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const interval = searchParams.get("interval") ?? "1h";
  const limit = Number(searchParams.get("limit") ?? "500");

  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  const baseUrl = process.env.BINANCE_BASE_URL || "https://api.binance.com";
  const endpoint = `${baseUrl}/api/v3/klines`;

  const params = {
    symbol: symbol.toUpperCase(),
    interval,
    limit,
  };

  try {
    const { data } = await axios.get(endpoint, { params });
    return NextResponse.json({ data });
  } catch (error: any) {
    const status = error?.response?.status ?? 500;
    const message = error?.response?.data ?? "failed to fetch klines";
    return NextResponse.json({ error: message }, { status });
  }
}
