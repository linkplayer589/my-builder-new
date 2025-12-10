import { type LocalizedText, type CalculatedPrice } from "@/types/index";

export type GetProductsAPIReturnType = {
    startDate: string;
    resortId: number;
    catalogs: Catalog[];
};
export type Catalog = {
    catalogId: string;
    version: number;
    products: Product[];
}

type consumerCategory = {
    id: string;
    name: LocalizedText;
    description: LocalizedText;
    ageMin: number;
    ageMax: number;
}

export type validityCategory = {
    id: string;
    unit: LocalizedText;
    value: number;
}

export type Product = {
    id: string;
    name: LocalizedText;
    description: LocalizedText;
    validityCategory: validityCategory;
    priceCategories: priceCategory[];
}

export type priceCategory = {
    consumerCategoryId: string;
    consumerCategoryData: consumerCategory;
    price?: CalculatedPrice;
    success: boolean;
};