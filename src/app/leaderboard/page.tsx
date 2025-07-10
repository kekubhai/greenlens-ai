'use client'
import { useState, useEffect } from 'react'
import { getAllRewards, getUserByEmail } from '@/utils/db/action'
import { Loader, Award, User, Trophy, Crown, Coins } from 'lucide-react'
import { toast } from 'react-hot-toast'

type Reward = {
  id: number
  userId: number
  points: number
  level: number
  createdAt: Date
  userName: string | null
}

export default function LeaderboardPage() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: number; email: string; name: string } | null>(null)

  useEffect(() => {
    const fetchRewardsAndUser = async () => {
      setLoading(true)
      try {
        const fetchedRewards = await getAllRewards()
        setRewards(fetchedRewards)

        const userEmail = localStorage.getItem('userEmail')
        if (userEmail) {
          const fetchedUser = await getUserByEmail(userEmail)
          if (fetchedUser) {
            setUser(fetchedUser)
          } else {
            toast.error('User not found. Please log in again.')
          }
        } else {
          toast.error('User not logged in. Please log in.')
        }
      } catch (error) {
        console.error('Error fetching rewards and user:', error)
        toast.error('Failed to load leaderboard. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchRewardsAndUser()
  }, [])

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">Leaderboard</h1>
        <p className="text-muted-foreground">See how you rank among our top environmental champions</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin h-8 w-8 text-green-600" />
        </div>
      ) : (
        <div className="bg-card border border-border shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
            <div className="flex justify-between items-center text-white">
              <Trophy className="h-10 w-10" />
              <span className="text-2xl font-bold">Top Performers</span>
              <Award className="h-10 w-10" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Points</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rewards.map((reward, index) => (
                  <tr key={reward.id} className={`${user && user.id === reward.userId ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : ''} hover:bg-muted/50 transition-colors duration-150 ease-in-out`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-10 h-10">
                        {index < 3 ? (
                          <Crown className={`h-6 w-6 ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : 'text-yellow-600'}`} />
                        ) : (
                          <span className="text-sm font-medium text-foreground">{index + 1}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-full w-full rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">{reward.userName || "Anonymous"}</div>
                          {user && user.id === reward.userId && (
                            <div className="text-xs text-green-600 dark:text-green-400 font-medium">You</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Coins className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm font-semibold text-foreground">{reward.points.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300">
                        Level {reward.level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}