import { redirect } from "next/navigation"

export default async function Page({
  params,
}: {
  params: Promise<{ resortName: string }>
}) {
  const { resortName } = await params
  redirect(`/admin/${resortName}/orders`)
}
