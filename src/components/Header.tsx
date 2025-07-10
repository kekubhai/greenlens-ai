'use client'
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Menu, Coins, Leaf, Search, Bell, User, ChevronDown, LogIn, LogOut } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/toggle-button"
import { Web3Auth } from "@web3auth/modal"
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base"
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import createUser, { getUserByEmail, getUnreadNotifications, markNotificationAsRead, getUserBalance } from "@/utils/db/action"
import { toast } from 'react-hot-toast'

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "WEB3_AUTH_CLIENT_ID";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7",
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const web3auth = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.TESTNET, 
  privateKeyProvider,
});

interface HeaderProps {
  onMenuClick: () => void;
  totalEarnings: number;
}

export default function Header({ onMenuClick, totalEarnings }: HeaderProps) {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const pathname = usePathname()
  const [notifications, setNotifications] = useState<any[]>([]);
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [balance, setBalance] = useState(0)

  // Check localStorage for existing login state on component mount
  useEffect(() => {
    const checkExistingLogin = () => {
      const userEmail = localStorage.getItem('userEmail');
      const userData = localStorage.getItem('userData');
      
      if (userEmail && userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          setUserInfo(parsedUserData);
          setLoggedIn(true);
        } catch (error) {
          console.error("Error parsing stored user data:", error);
          localStorage.removeItem('userData');
          localStorage.removeItem('userEmail');
        }
      }
    };

    checkExistingLogin();
  }, []);
  
  useEffect(() => {
    const init = async () => {
      try {
        await web3auth.initModal();
        setProvider(web3auth.provider);

        if (web3auth.connected) {
          setLoggedIn(true);
          const user = await web3auth.getUserInfo();
          setUserInfo(user);
          if (user.email) {
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('userData', JSON.stringify(user));
            try {
              await createUser(user.email, user.name || 'Anonymous User');
            } catch (error) {
              console.error("Error creating user:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error initializing Web3Auth:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (userInfo && userInfo.email) {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const unreadNotifications = await getUnreadNotifications(user.id);
          setNotifications(unreadNotifications);
        }
      }
    };

    if (loggedIn && userInfo) {
      fetchNotifications();
      
      // Set up periodic checking for new notifications
      const notificationInterval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
      return () => clearInterval(notificationInterval);
    }
  }, [userInfo, loggedIn]);

  useEffect(() => {
    const fetchUserBalance = async () => {
      if (userInfo && userInfo.email) {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const userBalance = await getUserBalance(user.id);
          setBalance(userBalance);
        }
      }
    };

    if (loggedIn && userInfo) {
      fetchUserBalance();

      // Add an event listener for balance updates
      const handleBalanceUpdate = (event: CustomEvent) => {
        setBalance(event.detail);
      };

      window.addEventListener('balanceUpdated', handleBalanceUpdate as EventListener);

      return () => {
        window.removeEventListener('balanceUpdated', handleBalanceUpdate as EventListener);
      };
    }
  }, [userInfo, loggedIn]);

  const login = async () => {
    if (!web3auth) {
      toast.error("Authentication service not ready. Please try again.");
      return;
    }
    
    try {
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      setLoggedIn(true);
      const user = await web3auth.getUserInfo();
      setUserInfo(user);
      
      if (user.email) {
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userData', JSON.stringify(user));
        try {
          await createUser(user.email, user.name || 'Anonymous User');
          toast.success(`Welcome ${user.name || user.email}!`);
        } catch (error) {
          console.error("Error creating user:", error);
          toast.error("Error setting up your account. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  const logout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    try {
      await web3auth.logout();
      setProvider(null);
      setLoggedIn(false);
      setUserInfo(null);
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userData');
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Error logging out. Please try again.");
    }
  };

  const getUserInfo = async () => {
    if (web3auth.connected) {
      const user = await web3auth.getUserInfo();
      setUserInfo(user);
      if (user.email) {
        localStorage.setItem('userEmail', user.email);
        try {
          await createUser(user.email, user.name || 'Anonymous User');
        } catch (error) {
          console.error("Error creating user:", error);
          // Handle the error appropriately, maybe show a message to the user
        }
      }
    }
  };

  const handleNotificationClick = async (notificationId: number) => {
    await markNotificationAsRead(notificationId);
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== notificationId)
    );
  };

  if (loading) {
    return (
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2 md:mr-4" onClick={onMenuClick}>
              <Menu className="h-6 w-6" />
            </Button>
            <Link href="/" className="flex items-center">
              <Leaf className="h-6 w-6 md:h-8 md:w-8 text-green-500 mr-1 md:mr-2" />
              <div className="flex flex-col">
                <span className="font-bold text-base md:text-lg text-foreground">GreenLens AI</span>
                <span className="text-[8px] md:text-[10px] text-muted-foreground -mt-1">Waste Management</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center">
            <div className="animate-pulse bg-muted rounded-md h-8 w-16"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2 md:mr-4 hover:bg-accent" onClick={onMenuClick}>
            <Menu className="h-6 w-6" />
          </Button>
          <Link href="/" className="flex items-center group">
            <div className="relative">
              <Leaf className="h-6 w-6 md:h-8 md:w-8 text-green-500 mr-1 md:mr-2 transition-transform group-hover:scale-110" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base md:text-lg text-foreground group-hover:text-green-500 transition-colors">
                GreenLens AI
              </span>
              <span className="text-[8px] md:text-[10px] text-muted-foreground -mt-1">
                Waste Management Platform
              </span>
            </div>
          </Link>
        </div>
        
        {!isMobile && (
          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search waste reports, locations..."
                className="w-full px-4 py-2 pl-10 border border-input bg-background/50 text-foreground rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          {isMobile && (
            <Button variant="ghost" size="icon" className="hover:bg-accent">
              <Search className="h-5 w-5" />
            </Button>
          )}
          
          <ModeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-accent">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 px-1 min-w-[1.2rem] h-5 bg-red-500 hover:bg-red-600">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-2">
                <h4 className="font-semibold text-sm mb-2">Notifications</h4>
              </div>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                    className="p-3 cursor-pointer hover:bg-accent"
                  >
                    <div className="flex flex-col space-y-1">
                      <span className="font-medium text-sm">{notification.type}</span>
                      <span className="text-xs text-muted-foreground">{notification.message}</span>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem className="p-3 text-center text-muted-foreground">
                  No new notifications
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex items-center bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-full px-3 py-1.5">
            <Coins className="h-4 w-4 md:h-5 md:w-5 mr-1.5 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-sm md:text-base text-green-700 dark:text-green-300">
              {balance.toFixed(2)}
            </span>
          </div>
          
          {!loggedIn ? (
            <Button 
              onClick={login} 
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm md:text-base font-medium px-4 py-2 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Login
              <LogIn className="ml-1 md:ml-2 h-4 w-4 md:h-5 md:w-5" />
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-accent rounded-full px-3 py-2">
                  <div className="h-8 w-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  {!isMobile && (
                    <span className="text-sm font-medium">
                      {userInfo?.name?.split(' ')[0] || userInfo?.email?.split('@')[0] || "User"}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <p className="text-sm font-medium">{userInfo?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{userInfo?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}