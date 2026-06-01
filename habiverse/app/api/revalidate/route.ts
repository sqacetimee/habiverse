import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/revalidate
 * Busts the "planets" cache tag so the next layout render re-fetches from NASA.
 *
 * Protect with a secret:
 *   curl -X POST https://your-site.vercel.app/api/revalidate \
 *        -H "x-revalidate-secret: <REVALIDATE_SECRET>"
 *
 * Set REVALIDATE_SECRET in Vercel environment variables.
 * If the variable is not set the endpoint is open (fine for portfolio use).
 */
export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (secret) {
    const provided = req.headers.get("x-revalidate-secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }
  }

  revalidateTag("planets");
  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
