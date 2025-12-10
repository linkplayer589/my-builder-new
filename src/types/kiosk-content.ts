// Definition of the content structure for the kiosk application
export interface LanguageSpecificKioskContent {
    [flowName: string]: Flow;
}

// The flow object is a collection of pages
interface Flow {
    [pageName: string]: Page;
}

// The page object is a collection of elements that make up the page
interface Page {
    id: string;
    breadcrumbs?: Step[];
    title?: string;
    description?: string;
    inputs?: Input[];
    buttons?: Button[];
    navigation?: Navigation;
    instructions?: string;
    unit?: string;
    mappedList?: MappedList;
    popovers?: Popover[];
    stepList?: Step[];
    summeryCard?: SummeryCard;
}

interface Button {
    index: number;
    label: string;
    selectedLabel?: string;
    loadingLabel?: string;
    description?: string;
}

interface Stats {
    id: string;
    index: number;
    label: string;
    unit?: string;
}

interface Navigation {
    back?: Button;
    next?: Button;
    cancel?: Button;
    submit?: Button;
    stats?: Stats[];
}

interface Step {
    index: number;
    status?: "complete" | "current" | "upcoming";
    label: string;
    buttons?: Button[];
}

interface MappedList {
    title: string;
    items?: string[];
    extraOption?: ExtraOption;
}

interface ExtraOption {
    label: string;
    description: string;
}

interface Popover {
    index: number;
    title: string;
    description: string;
    instructions: string;
    button: Button;
}

interface Input {
    index: number;
    title?: string;
    placeholder?: string;
    options?: string[];
}

interface SummeryLine {
    index: number;
    key: string;
    unit: string | null;
    denomination: string | null;
    note: string | null;
    finalLine?: boolean;
    repeat?: boolean;
}

interface SummeryCard {
    heading: string | null;
    summeryLines: SummeryLine[];
}

interface LanguageCode {
    en: "en";
    it: "it";
    fr: "fr";
    de: "de";
};

export type AppContent = { [key in keyof LanguageCode]: LanguageSpecificKioskContent; }
