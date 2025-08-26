import { NextRequest } from "next/server";
import { ValuationInputSchema, valuationUSD } from "@/lib/valuation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ValuationInputSchema.parse(body);
    const { net, gross, fee } = valuationUSD(parsed);
    return Response.json(
      { usdValue: Number(net.toFixed(2)), breakdown: { gross, fee } },
      { status: 200 }
    );
  } catch (e: any) {
    const msg = e?.message ?? "Invalid input";
    return Response.json({ error: msg }, { status: 400 });
  }
}
