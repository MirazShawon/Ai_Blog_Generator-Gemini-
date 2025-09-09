"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { PenTool, Menu, X, LogOut } from 'lucide-react'
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { MotionDiv } from "@/components/ui/motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  role: string;
  subscription?: string;
}

// User Profile Management Service
class UserProfileService {
  static async fetchUserProfile(): Promise<UserProfile> {
    const requestOptions = {
      method: 'GET',
      credentials: 'include' as RequestCredentials,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const profileResponse = await fetch('/api/auth/user', requestOptions);
    
    if (!profileResponse.ok) {
      const errorDetails = await profileResponse.json().catch(() => ({}));
      
      const errorInfo = {
        status: profileResponse.status,
        statusText: profileResponse.statusText,
        errorData: errorDetails
      };
      
      throw new Error(`Profile fetch failed: ${JSON.stringify(errorInfo)}`);
    }
    
    const profileData = await profileResponse.json();
    
    return {
      name: profileData.user?.name || "User",
      email: profileData.user?.email || "",
      avatar: profileData.user?.avatar || "/placeholder.svg?height=40&width=40",
      role: profileData.user?.role || "user",
      subscription: profileData.user?.subscription || "free"
    };
  }
}

// Navigation Configuration Service
class NavigationService {
  static shouldDisplayNavbar(currentPath: string): boolean {
    const hiddenPaths = ['/', '/login', '/signup'];
    return !hiddenPaths.includes(currentPath);
  }

  static getNavigationItems(userProfile: UserProfile) {
    const baseItems = [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Generate", href: "/generate" },
      { name: "Drafts", href: "/drafts" },
      { name: "Search", href: "/search" },
    ];
    
    // Add premium features for admin/premium users
    if (userProfile.role === "admin" || userProfile.subscription === "premium") {
      baseItems.splice(baseItems.length - 1, 0, { name: "Collections", href: "/collections" });
    }
    
    return baseItems;
  }
}

// Authentication Management
class AuthenticationManager {
  static async performLogout(): Promise<void> {
    // Clear authentication cookie
    document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
}

export function Navbar() {
  const currentPath = usePathname()
  const navigationRouter = useRouter()
  const { toast } = useToast()
  const [isMobileMenuVisible, setMobileMenuVisibility] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "User",
    email: "",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "user",
    subscription: "free"
  })
  const [isProfileLoading, setProfileLoadingState] = useState(true)

  // Check navbar display requirements
  const navbarShouldBeVisible = NavigationService.shouldDisplayNavbar(currentPath);

  useEffect(() => {
    let componentIsMounted = true;

    if (!navbarShouldBeVisible) {
      setProfileLoadingState(false);
      return;
    }
    
    const initializeUserProfile = async () => {
      try {
        console.log('Initializing user profile...');
        
        const fetchedProfile = await UserProfileService.fetchUserProfile();
        console.log('Profile data retrieved:', fetchedProfile);
        
        if (componentIsMounted) {
          setUserProfile(fetchedProfile);
        }
      } catch (profileError) {
        console.error('Profile initialization failed:', profileError);
        
        const errorMessage = profileError instanceof Error ? profileError.message : 'Unknown error';
        
        // Handle authentication errors
        if (errorMessage.includes('"status":401')) {
          console.log('Authentication failed, redirecting to login...');
          navigationRouter.push('/login');
          return;
        }
        
        // Display error notification
        toast({
          title: "Profile Loading Error",
          description: "Unable to load user profile. Please refresh the page.",
          variant: "destructive"
        });
      } finally {
        if (componentIsMounted) {
          setProfileLoadingState(false);
        }
      }
    };

    initializeUserProfile();

    return () => {
      componentIsMounted = false;
    };
  }, [navigationRouter, currentPath, navbarShouldBeVisible, toast]);

  // Handle user logout functionality
  const processUserLogout = async () => {
    try {
      await AuthenticationManager.performLogout();
      
      // Redirect to login page
      navigationRouter.push('/login')
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      })
    } catch (logoutError) {
      console.error('Logout process failed:', logoutError)
      toast({
        title: "Logout failed",
        description: "There was a problem logging out",
        variant: "destructive"
      })
    }
  }

  if (!navbarShouldBeVisible) {
    return null;
  }

  const navigationItems = NavigationService.getNavigationItems(userProfile);

  if (isProfileLoading) {
    return <div className="h-16 border-b bg-background/95"></div>;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b maroon-glass backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-[2000px]">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 md:gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <MotionDiv initial={{ rotate: -10 }} animate={{ rotate: 0 }} transition={{ duration: 0.5, type: "spring" }}>
                <PenTool className="h-6 w-6 text-maroon" />
              </MotionDiv>
              <span className="hidden text-xl font-bold md:inline-block text-maroon">BlogAI</span>
            </Link>

            <div className="hidden md:flex md:items-center md:gap-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    currentPath === item.href ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <div className="hidden md:flex md:items-center md:gap-2">
              <Link href="/profile">
                <div className="flex items-center gap-2 pl-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                    <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium lg:inline-block">{userProfile.name}</span>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={processUserLogout}
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Log out</span>
              </Button>
            </div>

            <div className="md:hidden">
              <SidebarTrigger />
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={() => setMobileMenuVisibility(!isMobileMenuVisible)}
            >
              {isMobileMenuVisible ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuVisible && (
        <MotionDiv
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="container border-t md:hidden">
            <div className="flex flex-col space-y-3 py-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
                    currentPath === item.href ? "bg-muted text-primary" : "text-muted-foreground"
                  }`}
                  onClick={() => setMobileMenuVisibility(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                    <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{userProfile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={processUserLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Log out</span>
                </Button>
              </div>
            </div>
          </div>
        </MotionDiv>
      )}
    </header>
  )
}
