'use client'
import { useState, useEffect } from 'react'
import { Coins, ArrowUpRight, ArrowDownRight, Gift, AlertCircle, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createTransaction, getAvailableRewards, getRewardTransactions, getUserByEmail, redeemReward } from '@/utils/db/action'
import { toast } from 'react-hot-toast'

type Transaction = {
  id: number
  type: 'earned_report' | 'earned_collect' | 'redeemed'
  amount: number
  description: string
  date: string
}

type Reward = {
  id: number
  name: string
  cost: number
  description: string | null
  collectionInfo: string
}

export default function RewardsPage() {
  const [user, setUser] = useState<{ id: number; email: string; name: string } | null>(null)
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserDataAndRewards = async () => {
      setLoading(true)
      try {
        const userEmail = localStorage.getItem('userEmail')
        if (userEmail) {
          const fetchedUser = await getUserByEmail(userEmail)
          if (fetchedUser) {
            setUser(fetchedUser)
            const fetchedTransactions = await getRewardTransactions(fetchedUser.id)
            setTransactions(fetchedTransactions as Transaction[])
            const fetchedRewards = await getAvailableRewards(fetchedUser.id)
            setRewards(fetchedRewards.filter(r => r.cost > 0)) // Filter out rewards with 0 points
            const calculatedBalance = fetchedTransactions.reduce((acc, transaction) => {
              return transaction.type.startsWith('earned') ? acc + transaction.amount : acc - transaction.amount
            }, 0)
            setBalance(Math.max(calculatedBalance, 0)) // Ensure balance is never negative
          } else {
            toast.error('User not found. Please log in again.')
          }
        } else {
          toast.error('User not logged in. Please log in.')
        }
      } catch (error) {
        console.error('Error fetching user data and rewards:', error)
        toast.error('Failed to load rewards data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchUserDataAndRewards()
  }, [])

  const handleRedeemReward = async (rewardId: number) => {
    if (!user) {
      toast.error('Please log in to redeem rewards.')
      return
    }

    const reward = rewards.find(r => r.id === rewardId)
    if (reward && balance >= reward.cost && reward.cost > 0) {
      try {
        if (balance < reward.cost) {
          toast.error('Insufficient balance to redeem this reward')
          return
        }

        // Update database
        await redeemReward(user.id, rewardId);
        
        // Create a new transaction record
        await createTransaction(user.id, 'redeemed', reward.cost, `Redeemed ${reward.name}`);

        // Refresh user data and rewards after redemption
        await refreshUserData();

        toast.success(`You have successfully redeemed: ${reward.name}`)
      } catch (error) {
        console.error('Error redeeming reward:', error)
        toast.error('Failed to redeem reward. Please try again.')
      }
    } else {
      toast.error('Insufficient balance or invalid reward cost')
    }
  }

  const handleRedeemAllPoints = async () => {
    if (!user) {
      toast.error('Please log in to redeem points.');
      return;
    }

    if (balance > 0) {
      try {
        // Update database
        await redeemReward(user.id, 0);
        
        // Create a new transaction record
        await createTransaction(user.id, 'redeemed', balance, 'Redeemed all points');

        // Refresh user data and rewards after redemption
        await refreshUserData();

        toast.success(`You have successfully redeemed all your points!`);
      } catch (error) {
        console.error('Error redeeming all points:', error);
        toast.error('Failed to redeem all points. Please try again.');
      }
    } else {
      toast.error('No points available to redeem')
    }
  }

  const refreshUserData = async () => {
    if (user) {
      const fetchedUser = await getUserByEmail(user.email);
      if (fetchedUser) {
        const fetchedTransactions = await getRewardTransactions(fetchedUser.id);
        setTransactions(fetchedTransactions as Transaction[]);
        const fetchedRewards = await getAvailableRewards(fetchedUser.id);
        setRewards(fetchedRewards.filter(r => r.cost > 0)); // Filter out rewards with 0 points
        
        // Recalculate balance
        const calculatedBalance = fetchedTransactions.reduce((acc, transaction) => {
          return transaction.type.startsWith('earned') ? acc + transaction.amount : acc - transaction.amount
        }, 0)
        setBalance(Math.max(calculatedBalance, 0)) // Ensure balance is never negative
      }
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <Loader className="animate-spin h-8 w-8 text-gray-600" />
    </div>
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">Rewards Dashboard</h1>
        <p className="text-muted-foreground">Track your earnings and redeem exciting rewards</p>
      </div>
      
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 md:p-8 rounded-2xl shadow-lg text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Current Balance</h2>
            <div className="flex items-center">
              <Coins className="h-8 w-8 mr-3 text-green-200" />
              <span className="text-4xl font-bold">{balance}</span>
              <span className="text-green-200 ml-2">points</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-green-200 text-sm">Available to redeem</p>
            <p className="text-2xl font-bold">${(balance * 0.01).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">Recent Transactions</h2>
          <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
            {transactions.length > 0 ? (
              <div className="divide-y divide-border">
                {transactions.map(transaction => (
                  <div key={transaction.id} className="p-4 flex justify-between items-center hover:bg-muted/50 transition-colors">
                    <div className="flex items-center">
                      {transaction.type === 'earned_report' ? (
                        <ArrowUpRight className="w-5 h-5 text-green-500 mr-3" />
                      ) : transaction.type === 'earned_collect' ? (
                        <ArrowUpRight className="w-5 h-5 text-blue-500 mr-3" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-red-500 mr-3" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${transaction.type.startsWith('earned') ? 'text-green-500' : 'text-red-500'}`}>
                      {transaction.type.startsWith('earned') ? '+' : '-'}{transaction.amount}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">No transactions yet</div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6 text-foreground">Available Rewards</h2>
          <div className="space-y-4">
            {rewards.length > 0 ? (
              rewards.map(reward => (
                <div key={reward.id} className="bg-card border border-border p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{reward.name}</h3>
                    <span className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                      {reward.cost} points
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-2 text-sm">{reward.description}</p>
                  <p className="text-xs text-muted-foreground mb-4">{reward.collectionInfo}</p>
                  {reward.id === 0 ? (
                    <div className="space-y-2">
                      <Button 
                        onClick={handleRedeemAllPoints}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        disabled={balance === 0}
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        Redeem All Points
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => handleRedeemReward(reward.id)}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      disabled={balance < reward.cost}
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      Redeem Reward
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-xl">
                <div className="flex items-center">
                  <AlertCircle className="h-6 w-6 text-yellow-400 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">No Rewards Available</h3>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">Check back later for new rewards!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}