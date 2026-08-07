export type MerchantCenterProductsType = {
    id: string
    title: string
    description: string
    link: string
    image_link: string
    price: string
    availability: "in stock" | "out of stock"
    condition: "new"
    brand: string
    gtin?: string
    identifier_exists: "yes" | "no"
    google_product_category?: string
    shipping?: string
    store_code?: string
}