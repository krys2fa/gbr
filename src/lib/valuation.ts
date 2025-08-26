import { z } from "zod";

export const ValuationInputSchema = z.object({
  karat: z.number().min(8).max(24),
  weightGrams: z.number().positive(),
  impuritiesPct: z.number().min(0).max(20).default(0),
});
export type ValuationInput = z.infer<typeof ValuationInputSchema>;

export function computePurity(karat: number) {
  return karat / 24; // 24k = 100%
}

export function valuationUSD(
  input: ValuationInput,
  opts?: { spotUSD?: number; feeBps?: number }
) {
  const { karat, weightGrams, impuritiesPct } =
    ValuationInputSchema.parse(input);
  const spotUSD = opts?.spotUSD ?? Number(process.env.GOLD_SPOT_USD ?? 2400);
  const feeBps = opts?.feeBps ?? Number(process.env.FEE_BPS ?? 50); // 0.5%

  const gramsPerTroyOunce = 31.1034768;
  const purity = computePurity(karat) * (1 - impuritiesPct / 100);
  const pureGoldGrams = weightGrams * purity;
  const ounces = pureGoldGrams / gramsPerTroyOunce;
  const gross = ounces * spotUSD;
  const fee = (gross * feeBps) / 10_000;
  const net = Math.max(gross - fee, 0);
  return { gross, fee, net };
}
