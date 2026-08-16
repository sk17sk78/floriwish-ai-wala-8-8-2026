import { NextRequest, NextResponse } from "next/server";
import { revalidateSingleModule, type IRevalidateModuleParams } from "@/lib/redis/revalidateModule";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as IRevalidateModuleParams;
    if (!body || !body.module) {
      return NextResponse.json({ success: false, message: "Module name is required" }, { status: 400 });
    }

    const result = await revalidateSingleModule(body);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[ERR Module Revalidation API]", error);
    return NextResponse.json({ success: false, message: error.message || "Cache refresh failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const targetModule = (url.searchParams.get("module") || "homepage") as any;
    const slug = url.searchParams.get("slug") || undefined;
    const categorySlug = url.searchParams.get("categorySlug") || undefined;
    const topicSlug = url.searchParams.get("topicSlug") || undefined;
    const subTopicSlug = url.searchParams.get("subTopicSlug") || undefined;
    const subSubTopicSlug = url.searchParams.get("subSubTopicSlug") || undefined;
    const subSubSubTopicSlug = url.searchParams.get("subSubSubTopicSlug") || undefined;

    const result = await revalidateSingleModule({
      module: targetModule,
      slug,
      categorySlug,
      topicSlug,
      subTopicSlug,
      subSubTopicSlug,
      subSubSubTopicSlug
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[ERR Module Revalidation GET API]", error);
    return NextResponse.json({ success: false, message: error.message || "Cache refresh failed" }, { status: 500 });
  }
}
