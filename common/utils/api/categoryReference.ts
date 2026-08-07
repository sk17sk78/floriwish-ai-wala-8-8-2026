// libraries
import mongoose from "mongoose";

/**
 * Updates all redundant image references to a category across multiple collections.
 * This is used when a category's primary image is updated.
 * 
 * @param slug The slug of the category being updated
 * @param newImageId The ID of the new image (from media.icon)
 */
export const updateCategoryReferenceImages = async (slug: string, newImageId: string) => {
    if (!slug || !newImageId) return;

    // Normalize paths to check for common patterns
    const pathsToMatch = [
        slug, 
        `/${slug}`, 
        ` ${slug}`, 
        `/${slug} `,
        `${slug} `
    ];
    
    try {
        const HomepageLayouts = mongoose.models.HomepageLayout;
        const Topics = mongoose.models.Topic;
        const SubTopics = mongoose.models.SubTopic;
        const SubSubTopics = mongoose.models.SubSubTopic;
        const SubSubSubTopics = mongoose.models.SubSubSubTopic;
        const ContentCategories = mongoose.models.ContentCategory;

        // 1. Update HomepageLayouts
        if (HomepageLayouts) {
            await HomepageLayouts.updateMany(
                { "layout.category.images.path": { $in: pathsToMatch } },
                { $set: { "layout.category.images.$[elem].image": newImageId } },
                { arrayFilters: [{ "elem.path": { $in: pathsToMatch } }] }
            );
        }

        // 2. Update Topics, SubTopics, SubSubTopics, SubSubSubTopics
        const topicModels = [
            Topics,
            SubTopics,
            SubSubTopics,
            SubSubSubTopics
        ];

        for (const model of topicModels) {
            if (!model) continue;
            await model.updateMany(
                { "media.quickLinks.path": { $in: pathsToMatch } },
                { $set: { "media.quickLinks.$[elem].image": newImageId } },
                { arrayFilters: [{ "elem.path": { $in: pathsToMatch } }] }
            );
        }

        // 3. Update Other ContentCategories (quickLinks)
        if (ContentCategories) {
            await ContentCategories.updateMany(
                { "media.quickLinks.path": { $in: pathsToMatch } },
                { $set: { "media.quickLinks.$[elem].image": newImageId } },
                { arrayFilters: [{ "elem.path": { $in: pathsToMatch } }] }
            );
        }
        
        console.log(`Cascading update completed for category: ${slug}`);
    } catch (error) {
        console.error(`Error in cascading update for category ${slug}:`, error);
    }
};
