import { revalidateTag } from "next/cache"
import { type NextRequest } from "next/server"

export async function POST(request: NextRequest) {
    console.log("🔄 [API] Revalidating tags...")
    try {
        const { tags } = await request.json() as { tags: string[] }

        // Batch all revalidations
        await Promise.all(tags.map((tag) => revalidateTag(tag, "max")))

        return Response.json({ revalidated: true, now: Date.now() })
    } catch (error) {
        return Response.json(
            { revalidated: false, error: "Failed to revalidate" },
            { status: 500 }
        )
    }
}