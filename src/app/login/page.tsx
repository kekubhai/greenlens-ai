'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Leaf, ArrowRight, Recycle, Users, Award } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if already logged in
    const userEmail = localStorage.getItem('userEmail')
    if (userEmail) {
      router.push('/')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Leaf className="h-12 w-12 text-green-500 mr-3" />
            <div>
              <h1 className="text-4xl font-bold text-foreground">GreenLens AI</h1>
              <p className="text-muted-foreground">Waste Management Platform</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Join the Green Revolution
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Help create a cleaner, more sustainable world through AI-powered waste management.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                  <Recycle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Report & Collect Waste</h3>
                  <p className="text-sm text-muted-foreground">Use AI to identify and report waste, earn rewards for collection</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Community Impact</h3>
                  <p className="text-sm text-muted-foreground">Join thousands making a difference in their communities</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                  <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Earn Rewards</h3>
                  <p className="text-sm text-muted-foreground">Get tokens for your environmental contributions</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border p-8 rounded-2xl shadow-xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">Get Started</h3>
              <p className="text-muted-foreground">
                Create your account and start making an impact today
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Please use the login button in the header to access your account with Web3Auth
              </p>
              
              <div className="text-center">
                <Link href="/">
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105">
                    Go to Homepage
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
