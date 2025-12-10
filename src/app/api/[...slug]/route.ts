import { NextRequest, NextResponse } from "next/server"
import { getPayload } from "payload"

import config from "../../../../payload.config"

async function handleRequest(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const url = new URL(req.url)
    const path = url.pathname.replace("/api/", "")

    // Handle different HTTP methods
    if (req.method === "GET") {
      if (path === "email-templates") {
        const templates = await payload.find({
          collection: "email-templates",
          limit: 100,
        })
        return NextResponse.json(templates)
      }

      // Handle single template by ID
      const parts = path.split("/")
      if (parts[0] === "email-templates" && parts[1]) {
        const template = await payload.findByID({
          collection: "email-templates",
          id: parts[1],
        })
        return NextResponse.json({ doc: template })
      }
    }

    if (req.method === "POST") {
      if (path === "email-templates") {
        const body = await req.json()
        const template = await payload.create({
          collection: "email-templates",
          data: body,
        })
        return NextResponse.json(template)
      }
    }

    if (req.method === "PATCH") {
      const parts = path.split("/")
      if (parts[0] === "email-templates" && parts[1]) {
        const body = await req.json()
        const template = await payload.update({
          collection: "email-templates",
          id: parts[1],
          data: body,
        })
        return NextResponse.json(template)
      }
    }

    if (req.method === "DELETE") {
      const parts = path.split("/")
      if (parts[0] === "email-templates" && parts[1]) {
        await payload.delete({
          collection: "email-templates",
          id: parts[1],
        })
        return NextResponse.json({ success: true })
      }
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  return handleRequest(req)
}

export async function POST(req: NextRequest) {
  return handleRequest(req)
}

export async function PATCH(req: NextRequest) {
  return handleRequest(req)
}

export async function DELETE(req: NextRequest) {
  return handleRequest(req)
}
