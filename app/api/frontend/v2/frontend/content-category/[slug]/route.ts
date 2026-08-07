// next config
export const dynamic = "force-dynamic";

// libraries
import { get as getFromRedis, set as setToRedis } from "@/db/redis/methods";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// models
import models from "@/db/mongoose/models";

const { ContentCategories, Contents } = models;

// constants
import { CONTENT_CATEGORY_PAGE_CACHE_KEY } from "@/common/constants/cacheKeys";
import { serverErrorResponse } from "@/common/utils/api/error";

// controllers
import { getCategoryData } from "./controller";

export async function GET(
  request: NextRequest,
  { params: { slug } }: { params: { slug: string } }
) {
  try {
    const data = await getCategoryData(slug);

    if (!data) {
      return NextResponse.json(
        { error: "Category doesn't exist" },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(serverErrorResponse, { status: 500 });
  }
}
