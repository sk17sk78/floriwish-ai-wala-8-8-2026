// libraries
import moment from "moment";

// requests
import { revalidateSubSubTopicPage } from "../requests/revalidateSubTopicPage";

// components
import TupleActions from "@/components/(_common)/TableLayout/TupleActions";

// types
import { type AdminTableData } from "@/common/types/layouts/admin/adminTableLayout";
import { type CityDocument } from "@/common/types/documentation/presets/city";
import { type ContentCategoryDocument } from "@/common/types/documentation/categories/contentCategory";
import { type PermissionDocument } from "@/common/types/documentation/nestedDocuments/permission";
import { type SubTopicDocument } from "@/common/types/documentation/pages/subTopic";
import { type TableContent } from "@/components/(_common)/TableLayout/TableContent";
import { type TopicDocument } from "@/common/types/documentation/pages/topic";
import { type SubSubTopicDocument } from "@/common/types/documentation/pages/subSubTopic";
import SubSubTopicPersonalizedReviewsForm from "../components/SubSubTopicPersonalizedReviewsForm";

const getTableContentGenerator =
  ({
    permission,
    contentCategories,
    topics,
    subTopics,
    cities,
    isSuperAdmin
  }: {
    permission?: PermissionDocument;
    contentCategories: ContentCategoryDocument[];
    topics: TopicDocument[];
    subTopics: SubTopicDocument[];
    cities: CityDocument[];
    isSuperAdmin?: boolean;
  }) =>
    ({
      documents,
      state: {
        pagination: { offset },
        query: { sortBy, orderBy },
        trash: { showTrash }
      },
      method: {
        onUpdate,
        onUpdateDocument,
        onActivate,
        onDeactivate,
        onTrash,
        onRestore,
        onDelete,
        onSort,
        onShowToast
      }
    }: AdminTableData<SubSubTopicDocument>): TableContent => ({
      header: [
        {
          label: "Category 1",
          span: 3,
          sortable: true,
          align: "left",
          currSortValue: sortBy === "name" ? orderBy : "none",
          setSortValue: () => {
            onSort({ newSortBy: "name" });
          }
        },
        {
          label: "Category 2",
          span: 3,
          sortable: false,
          align: "left",
        },
        {
          label: "Category 3",
          span: 3,
          sortable: false,
          align: "left",
        },
        {
          label: "Category 4",
          span: 3,
          sortable: false,
          align: "left",
        },
        {
          label: "Reviews",
          span: 2,
          sortable: false
        },
        {
          label: "Actions",
          span: 3,
          sortable: false
        }
      ],
      data: documents.map(
        ({
          _id,
          category,
          topic,
          subTopic,
          name,
          slug,
          city,
          personalizedReviews,
          isActive,
          createdBy,
          createdAt,
          updatedBy,
          updatedAt
        }) => ({
          cols: [
            {
              value: {
                label:
                  contentCategories.find(
                    ({ _id }) => String(_id) === String(category)
                  )?.name || "",
                type: "text",
                align: "left"
              },
              action: { action: () => { }, type: "none" }
            },
            {
              value: {
                label:
                  topics.find(({ _id }) => String(_id) === String(topic))?.name || "",
                type: "text",
                align: "left"
              },
              action: { action: () => { }, type: "none" }
            },
            {
              value: {
                label:
                  subTopics.find(({ _id }) => String(_id) === String(subTopic))?.name || "",
                type: "text",
                align: "left"
              },
              action: { action: () => { }, type: "none" }
            },
            {
              value: {
                label: slug,
                type: "text",
                align: "left"
              },
              action: { action: () => { }, type: "none" }
            },
            {
              value: {
                label: (
                  <SubSubTopicPersonalizedReviewsForm
                    initialReviews={personalizedReviews || []}
                    onUpdate={(updatedDocument: Partial<SubSubTopicDocument>) => {
                      onUpdateDocument({
                        documentId: String(_id),
                        updatedDocument
                      });
                    }}
                  />
                ),
                type: "svg",
                align: "center"
              },
              action: { action: () => { }, type: "component" }
            },
            {
              value: {
                label: (
                  <TupleActions
                    isSuperAdmin={isSuperAdmin}
                    showActiveInactive={!showTrash}
                    isActive={isActive}
                    showRevalidateCache={true}
                    onClickRevalidateCache={() => {
                      revalidateSubSubTopicPage({
                        categorySlug:
                          contentCategories.find(
                            ({ _id }) => String(_id) === String(category)
                          )?.slug || "",
                        topicSlug:
                          topics.find(({ _id }) => String(_id) === String(topic))
                            ?.slug || "",
                        subTopicSlug:
                          subTopics.find(({ _id }) => String(_id) === String(subTopic))
                            ?.slug || "",
                        subSubTopicSlug: slug
                      })
                        .then(() => {
                          onShowToast({
                            variant: "success",
                            title: "Success",
                            description: `Successfully revalidated "${name}"`
                          });
                        })
                        .catch(() => {
                          onShowToast({
                            variant: "destructive",
                            title: "Failed",
                            description: `Couldn't revalidated "${name}"`
                          });
                        });
                    }}
                    showEdit={Boolean(permission?.update) && !showTrash}
                    showRestore={showTrash}
                    showDrop={Boolean(permission?.delete) && !showTrash}
                    dropConfirmationDialogTitle="Move to Trash?"
                    showDelete={showTrash}
                    deleteConfirmationDialogTitle="Delete?"
                    onToggleActiveInactive={
                      isActive
                        ? () => {
                          onDeactivate({ documentId: String(_id) });
                        }
                        : () => {
                          onActivate({ documentId: String(_id) });
                        }
                    }
                    onClickEdit={() => {
                      onUpdate({ documentId: String(_id) });
                    }}
                    onClickRestore={() =>
                      onRestore({ documentId: String(_id) })
                    }
                    onClickDrop={() => onTrash({ documentId: String(_id) })}
                    onClickDelete={() => onDelete({ documentId: String(_id) })}
                    showExternalLink
                    linkHref={`/${contentCategories.find(({ _id }) => String(_id) === String(category))?.slug}/${topics.find(({ _id }) => String(_id) === String(topic))?.slug}/${subTopics.find(({ _id }) => String(_id) === String(subTopic))?.slug}/${slug}`}
                  />
                ),
                type: "svg"
              },
              action: { action: () => { }, type: "component" }
            }
          ],
          batchSelectData: String(_id),
          hoverData: undefined
        })
      ),
      offset
    });

export default getTableContentGenerator;
