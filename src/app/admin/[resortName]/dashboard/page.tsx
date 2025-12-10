import { redirect } from "next/navigation"

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ resortName: string }>
}) {
  const { resortName } = await params
  // Redirect to the sales statistics page by default
  redirect(`/admin/${resortName}/dashboard/statistics`)
}
