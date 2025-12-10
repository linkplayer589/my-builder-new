import Link from "next/link"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import LifePassLogoBlue from "@/components/branding-and-logos/lifepass-logo-blue"

export default function Page() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="flex flex-col items-center space-y-4">
          <div className="mb-4 w-[220px]">
            <LifePassLogoBlue className="w-full" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#233772]">
            Admin Panel
          </CardTitle>
          <CardDescription className="text-gray-600">
            Access the LifePass admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <SignedIn>
            <Link href="/admin">
              <Button
                className="w-full bg-[#233772] text-white hover:bg-[#5164AC]"
                size="lg"
              >
                Continue to Admin Panel
              </Button>
            </Link>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button
                className="w-full bg-[#233772] text-white hover:bg-[#5164AC]"
                size="lg"
              >
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
        </CardContent>
      </Card>
    </div>
  )
}
