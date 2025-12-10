import type { LocalizedText } from "@/types/index";

export interface SkiDataConsumerCategory {
    id: string;
    externalId: string;
    name: LocalizedText;
    description: LocalizedText;
    active: boolean;
    sortOrder: number;
    reservedForSpecialUseCase: boolean;
    fromDate?: string;
    toDate?: string;
    ageMin?: number;
    ageMax?: number;
}
