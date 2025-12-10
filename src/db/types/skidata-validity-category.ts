import type { LocalizedText } from "@/types/index";

export interface SkiDataValidityCategory {
    id: string;
    externalId: string;
    name: LocalizedText;
    active: boolean;
    validityValue: number;
    validityUnit: string;
    variable: boolean;
}