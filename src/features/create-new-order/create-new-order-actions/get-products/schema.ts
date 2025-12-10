import { isTodayOrFutureDate } from '@/utils/validation/dateFunctions';
import * as z from 'zod';


export const getProductsSchema = z.object({
    resortId: z.number(),
    startDate: z.string().refine((data) => {
        if (isNaN(Date.parse(data))) {
            return false; // Invalid date format
        }
        return isTodayOrFutureDate(data);
    }, 'Must be a valid date string and today or in the future'),
});
export type GetProductsSchemaType = z.infer<typeof getProductsSchema>;

