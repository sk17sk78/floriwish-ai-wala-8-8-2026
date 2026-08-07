// next config
export const dynamic = "force-dynamic";

// controllers
import { getBlogCategoryArticles } from "../../controllers";

// constants
import {
  notFoundErrorResponse,
  serverErrorResponse
} from "@/common/utils/api/error";

// utils
import { Response } from "@/common/utils/api/next";
import { successData } from "@/common/utils/api/data";

// types
import { type APIResponseType } from "@/common/types/apiTypes";
import { type BlogArticleDocument } from "@/common/types/documentation/blog/blogArticle";
import { type BlogCategoryDocument } from "@/common/types/documentation/blog/blogCategory";
import { type NextRequest } from "next/server";

export const GET = async (
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
): Promise<
  APIResponseType<{
    category: BlogCategoryDocument;
    articles: BlogArticleDocument[];
  }>
> => {
  try {
    const result = await getBlogCategoryArticles({ id });

    if (!result) {
      return Response<{
        category: BlogCategoryDocument;
        articles: BlogArticleDocument[];
      }>(notFoundErrorResponse);
    }

    return Response(successData(result));
  } catch (error: any) {
    return Response<null>(serverErrorResponse);
  }
};
