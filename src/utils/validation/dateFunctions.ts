export const isTodayOrFutureDate = (dateStr: string | number | Date) => {
    const inputDate = new Date(dateStr);
    const today = new Date();

    // Set time portion of today to midnight to compare only the date part
    today.setHours(0, 0, 0, 0);

    return inputDate >= today;
};