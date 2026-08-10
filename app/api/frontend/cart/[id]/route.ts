// next config
export const dynamic = "force-dynamic";

// controllers
import { getCart, updateCart, addCart } from "../controller";

// constants
import {
  serverErrorResponse
} from "@/common/utils/api/error";

// utils
import { Response } from "@/common/utils/api/next";
import { successData } from "@/common/utils/api/data";

// types
import { type APIResponseType } from "@/common/types/apiTypes";
import { type CartDocument } from "@/common/types/documentation/dynamic/cart";
import { type NextRequest } from "next/server";

export const GET = async (
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
): Promise<APIResponseType<CartDocument>> => {
  try {
    const cart = await getCart({ id });

    if (!cart) {
      // Cart not found — return empty success so client can create a new one
      return Response(successData(null as any));
    }

    return Response(successData(cart));
  } catch (error: any) {
    return Response<null>(serverErrorResponse);
  }
};

export const PATCH = async (
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
): Promise<APIResponseType<CartDocument>> => {
  try {
    const cart = (await req.json()) as CartDocument;

    // Try to update existing cart
    let document = await updateCart({ id, cart });

    // If cart not found (stale ID), create a new one
    if (!document) {
      console.warn("[PATCH cart] Cart not found for id:", id, "— creating new cart");
      document = await addCart({ cart });
    }

    if (!document) {
      return Response<CartDocument>(serverErrorResponse as any);
    }

    return Response(successData(document));
  } catch (error: any) {
    return Response<null>(serverErrorResponse);
  }
};
