import type { LocalizedText } from "@/types/index";

export type SkiDataProduct = {
    id: string;
    type: string;
    name: LocalizedText;
    description: LocalizedText;
    isAdditionalProductOnly: boolean;
    productCategoryId: string;
    consumerCategoryIds: string[];
    attributes?: object;
    active: boolean;
    sortOrder: number;
    reservedForSpecialUseCase: boolean;
    contractorId: string;
    catalogId: string;
    externalId: string;
    contactRequired: boolean;
    issueValidityPeriodId?: string;
    additionalProductItems?: object;
    internalContingent: boolean;
    coding?: boolean;
    printing?: boolean;
    photoRequired?: 'yes' | 'no';
    depotPossible?: boolean;
    predatingPossible?: boolean;
    validityCategoryId?: string;

}
