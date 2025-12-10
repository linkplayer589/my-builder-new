"use server"
import { revalidateTag } from "next/cache";

export async function revalidateSessions() {
    console.log("revalidating sessions")
    revalidateTag("sessions", "max")
}
