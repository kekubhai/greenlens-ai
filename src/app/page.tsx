/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'
import { useState, useEffect } from 'react'
import { ArrowRight, Leaf, Recycle, Users, Coins, MapPin, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Poppins } from 'next/font/google'
import Link from 'next/link'

import { getRecentReports, getWasteCollectionTasks } from '@/utils/db/action'
const poppins = Poppins({ 
  weight: ['300', '400', '600'],
  subsets: ['latin'],
  display: 'swap',
})

function AnimatedGlobe() {
  return (
    <div className="relative w-32 h-32 mx-auto mb-8">
      <div className="absolute inset-0 rounded-full bg-red-700 opacity-90 animate-pulse"></div>
      <div className="absolute inset-2 rounded-full bg-green-400 opacity-40 animate-ping"></div>
      <div className="absolute inset-4 rounded-full bg-purple-400 opacity-60 animate-spin"></div>
      <div className="absolute inset-6 rounded-full bg-green-200 opacity-80 animate-bounce"></div>
      <Leaf className="absolute inset-0 m-auto h-16 w-16 text-blue-700 animate-pulse" />
    </div>
  )
}

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [impactData, setImpactData] = useState({
    wasteCollected: 0,
    reportsSubmitted: 0,
    tokensEarned: 0,
    co2Offset: 0
  });

  

  useEffect(() => {
    // Check if user is logged in
    const checkLoginStatus = () => {
      const userEmail = localStorage.getItem('userEmail');
      const userData = localStorage.getItem('userData');
      
      if (userEmail && userData) {
        setLoggedIn(true);
      }
    };

    checkLoginStatus();

    async function fetchImpactData() {
      try {
        const reports = await getRecentReports(100);  
        const tasks = await getWasteCollectionTasks(100);  

        const wasteCollected = tasks.reduce((total, task) => {
          const match = task.amount.match(/(\d+(\.\d+)?)/);
          const amount = match ? parseFloat(match[0]) : 0;
          return total + amount;
        }, 0);

        const reportsSubmitted = reports.length;
        const tokensEarned = reports.length * 10; // Fixed calculation
        const co2Offset = wasteCollected * 0.5;   

        setImpactData({
          wasteCollected: Math.round(wasteCollected * 10) / 10, 
          reportsSubmitted,
          tokensEarned,
          co2Offset: Math.round(co2Offset * 10) / 10 
        });
      } catch (error) {
        console.error("Error fetching impact data:", error);
        
        setImpactData({
          wasteCollected: 0.6,
          reportsSubmitted: 0,
          tokensEarned: 0,
          co2Offset: 0
        });
      }
    }

    fetchImpactData();

    // Listen for login state changes
    const handleStorageChange = () => {
      checkLoginStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = () => {
    setLoggedIn(true);
  };

  return (
    <div className={`container mx-auto px-4 py-16 ${poppins.className}`}>
      <section className="text-center mb-20">
        <AnimatedGlobe />
        <div className="space-y-4 mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight">
            GreenLens-AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Waste Management</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Join our community in making waste management more efficient and rewarding through AI-powered solutions!
          </p>
        </div>
        {!loggedIn ? (
          <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg py-6 px-10 rounded-full font-medium transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl">
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        ) : (
          <Link href="/report">
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg py-6 px-10 rounded-full font-medium transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl">
              Report Waste
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        )}
      </section>
      
      <section className="grid md:grid-cols-3 gap-10 mb-20">
        <FeatureCard
          icon={Leaf}
          title="Eco-Friendly"
          description="Contribute to a cleaner environment by reporting and collecting waste."
        />
        <FeatureCard
          icon={Coins}
          title="Earn Rewards"
          description="Get tokens for your contributions to waste management efforts."
        />
        <FeatureCard
          icon={Users}
          title="Community-Driven"
          description="Be part of a growing community committed to sustainable practices."
        />
      </section>
      
      <section className="bg-white p-10 rounded-3xl shadow-lg mb-20">
        <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">Our Impact</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <ImpactCard title="Waste Collected" value={`${impactData.wasteCollected} kg`} icon={Recycle} />
          <ImpactCard title="Reports Submitted" value={impactData.reportsSubmitted.toString()} icon={MapPin} />
          <ImpactCard title="Tokens Earned" value={impactData.tokensEarned.toString()} icon={Coins} />
          <ImpactCard title="CO2 Offset" value={`${impactData.co2Offset} kg`} icon={Leaf} />
        </div>
      </section>

   
    </div>
  )
}

function ImpactCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) {
  const formattedValue = typeof value === 'number' ? value.toLocaleString('en-US', { maximumFractionDigits: 1 }) : value;
  
  return (
    <div className="bg-card border border-border p-6 rounded-2xl shadow-lg text-center group hover:shadow-xl transition-all duration-300 hover:border-green-200 dark:hover:border-green-800">
      <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-3 rounded-full mb-4 mx-auto w-fit group-hover:scale-110 transition-transform duration-300">
        <Icon className="h-6 w-6 text-green-600 dark:text-green-400" />
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{formattedValue}</h3>
      <p className="text-muted-foreground text-sm">{title}</p>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="bg-card border border-border p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col items-center text-center group hover:border-green-200 dark:hover:border-green-800">
      <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
        <Icon className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>
      <h3 className="text-xl font-semibold mb-4 text-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}