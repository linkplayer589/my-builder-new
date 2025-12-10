// import { seedTasks } from "@/app/admin/orders/_lib/seeds"

async function runSeed() {
  console.log("⏳ Running seed...")

  const start = Date.now()

  // await seedTasks({ count: 100 })
  console.log("Seed tasks not available - legacy code removed")

  const end = Date.now()

  console.log(`✅ Seed completed in ${end - start}ms`)

  process.exit(0)
}

runSeed().catch((err) => {
  console.error("❌ Seed failed")
  console.error(err)
  process.exit(1)
})
