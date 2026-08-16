export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { revalidateSingleModule } from "@/lib/redis/revalidateModule";

export const GET = async (
  req: NextRequest,
  {
    params: { categorySlug, topicSlug, subTopicSlug, subSubTopicSlug, subSubSubTopicSlug }
  }: {
    params: {
      categorySlug: string;
      topicSlug: string;
      subTopicSlug: string;
      subSubTopicSlug: string;
      subSubSubTopicSlug: string;
    };
  }
): Promise<NextResponse> => {
  try {
    const result = await revalidateSingleModule({
      module: "category5",
      categorySlug,
      topicSlug,
      subTopicSlug,
      subSubTopicSlug,
      subSubSubTopicSlug
    });

    return NextResponse.json({
      redis: result.success,
      next: true,
      cloudfront: false,
      message: result.message
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ redis: false, next: false, cloudfront: false, error: error.message }, { status: 500 });
  }
};
