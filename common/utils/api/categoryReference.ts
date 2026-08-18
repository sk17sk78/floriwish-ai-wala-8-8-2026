// libraries
import mongoose from "mongoose";

/**
 * Retained for backward-compatibility.
 * Custom images set on Homepage (layout.category.images), Dynamic Pages,
 * and Smaller Pages (Topics, SubTopics, etc.) are explicitly preserved and NOT overwritten.
 */
export const updateCategoryReferenceImages = async (slug: string, newImageId: string) => {
    // Custom images assigned by admin on Homepage and Smaller Pages must remain intact.
    return;
};
