"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Sparkles, Clock, Map, LogOut, Plus, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface LeaderboardUser {
  _id: string;
  displayName: string;
  photoURL?: string;
  reputation: number;
  department?: string;
}

export default function LeaderboardPage() {
  const { user, logout } = useAuth();
  const [citizens, setCitizens] = useState<LeaderboardUser[]>([]);
  const [authorities, setAuthorities] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"citizens" | "authorities">("citizens");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      if (data.success) {
        setCitizens(data.citizens || []);
        setAuthorities(data.authorities || []);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard", error);
    } finally {
      setLoading(false);
    }
  };

  const usersList = activeTab === "citizens" ? citizens : authorities;
  const podium = usersList.slice(0, 3);
  // Reorder podium to render as: 2nd place | 1st place | 3rd place
  const reorderedPodium = [
    podium[1] ? { ...podium[1], rank: 2 } : null,
    podium[0] ? { ...podium[0], rank: 1 } : null,
    podium[2] ? { ...podium[2], rank: 3 } : null,
  ].filter(Boolean) as (LeaderboardUser & { rank: number })[];

  const remainingUsers = usersList.slice(3);

  // Find user's current ranking (if they are a citizen)
  const myRank = activeTab === "citizens" 
    ? citizens.findIndex((c) => c.displayName === user?.displayName) + 1 
    : -1;
  const myScore = activeTab === "citizens" 
    ? citizens.find((c) => c.displayName === user?.displayName)?.reputation ?? 0
    : 0;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground">Honor roll of Civora's top civic reformers and responsive officers.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/report">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20">
              <Plus className="w-4 h-4 mr-2" />
              Report Issue
            </Button>
          </Link>
          <Button onClick={logout} variant="ghost" size="sm" className="text-muted-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border/60 gap-8 text-sm">
        <Link 
          href="/citizen/dashboard" 
          className="pb-3 text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-border transition-all flex items-center gap-1.5"
        >
          <Clock className="w-4 h-4" />
          Feed & Reports
        </Link>
        <Link 
          href="/citizen/map" 
          className="pb-3 text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-border transition-all flex items-center gap-1.5"
        >
          <Map className="w-4 h-4" />
          Neighborhood Map
        </Link>
        <Link 
          href="/citizen/leaderboard" 
          className="pb-3 border-b-2 border-blue-500 font-semibold text-blue-400 flex items-center gap-1.5"
        >
          <Trophy className="w-4 h-4" />
          Leaderboard
        </Link>
      </div>

      {/* Main Leaderboard Panel */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-2">
          <div className="flex rounded-lg bg-surface/50 border border-border/50 p-1">
            <button
              onClick={() => setActiveTab("citizens")}
              className={`px-4 py-2 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "citizens"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-950/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Award className="w-4 h-4" />
              Top Citizens
            </button>
            <button
              onClick={() => setActiveTab("authorities")}
              className={`px-4 py-2 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "authorities"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-950/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Trophy className="w-4 h-4" />
              Top Officers
            </button>
          </div>

          {/* User Score Card */}
          {activeTab === "citizens" && user && (
            <div className="bg-surface/40 border border-border/40 rounded-xl px-4 py-2 flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center font-bold text-blue-400">
                {myRank > 0 ? `#${myRank}` : "N/A"}
              </div>
              <div>
                <p className="font-semibold text-xs leading-none text-muted-foreground">Your Rank</p>
                <p className="text-foreground text-sm font-bold mt-1">
                  {myScore} points {myRank > 0 && `(Top ${Math.round((myRank / Math.max(citizens.length, 1)) * 100)}%)`}
                </p>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-3 gap-4 h-56 rounded-xl bg-surface/30 border border-border" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-lg bg-surface/30 border border-border" />
              ))}
            </div>
          </div>
        ) : usersList.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl bg-surface/30">
            <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No leaderboard entries found yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Podium (Top 3 Users) */}
            <div className="grid grid-cols-3 items-end gap-3 sm:gap-6 pt-8 pb-4 max-w-3xl mx-auto">
              {reorderedPodium.map((podiumUser) => {
                const isFirst = podiumUser.rank === 1;
                const isSecond = podiumUser.rank === 2;
                const isThird = podiumUser.rank === 3;
                
                const heightClass = isFirst 
                  ? "h-56 sm:h-64 border-blue-500/40 bg-gradient-to-b from-blue-950/20 to-surface/40 shadow-blue-500/5" 
                  : isSecond
                  ? "h-48 sm:h-52 border-border/40 bg-surface/20"
                  : "h-40 sm:h-44 border-border/30 bg-surface/10";
                
                const rankColor = isFirst 
                  ? "text-yellow-400 font-bold bg-yellow-950/30 border border-yellow-500/20" 
                  : isSecond
                  ? "text-slate-300 font-bold bg-slate-800/40 border border-slate-500/20"
                  : "text-amber-600 font-bold bg-amber-950/20 border border-amber-800/25";

                return (
                  <Card 
                    key={podiumUser._id} 
                    className={`flex flex-col items-center justify-end p-4 border relative overflow-hidden transition-all hover:scale-102 ${heightClass}`}
                  >
                    {/* Crown or Star Icon */}
                    {isFirst && (
                      <div className="absolute top-2 animate-bounce">
                        <Sparkles className="w-6 h-6 text-yellow-400" />
                      </div>
                    )}
                    
                    <div className="flex flex-col items-center gap-2 mb-2 w-full text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center font-bold text-lg text-blue-400 overflow-hidden shadow-xl">
                        {podiumUser.photoURL ? (
                          <img src={podiumUser.photoURL} alt={podiumUser.displayName} className="w-full h-full object-cover" />
                        ) : (
                          podiumUser.displayName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-bold text-xs sm:text-sm line-clamp-1 text-foreground px-1">
                          {podiumUser.displayName}
                        </p>
                        {podiumUser.department && (
                          <p className="text-[10px] text-muted-foreground line-clamp-1">
                            {podiumUser.department}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="w-full space-y-2 mt-auto">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-sm font-bold text-foreground">
                          {podiumUser.reputation}
                        </span>
                        <span className="text-[10px] text-muted-foreground">pts</span>
                      </div>
                      <div className={`w-full py-1 text-center rounded-lg text-xs font-bold ${rankColor}`}>
                        {podiumUser.rank === 1 ? "1st Place" : podiumUser.rank === 2 ? "2nd Place" : "3rd Place"}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* List Table (Ranks 4-10) */}
            {remainingUsers.length > 0 && (
              <Card className="border-border/50 bg-card/30 backdrop-blur-sm shadow-xl">
                <CardContent className="p-0">
                  <div className="divide-y divide-border/60">
                    {remainingUsers.map((item, index) => {
                      const rank = index + 4;
                      return (
                        <div 
                          key={item._id} 
                          className="flex items-center justify-between p-4 transition-all hover:bg-surface/20"
                        >
                          <div className="flex items-center gap-4">
                            <span className="w-6 text-sm font-semibold text-muted-foreground text-center">
                              #{rank}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center font-bold text-xs text-blue-400 overflow-hidden border border-blue-500/10">
                              {item.photoURL ? (
                                <img src={item.photoURL} alt={item.displayName} className="w-full h-full object-cover" />
                              ) : (
                                item.displayName.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-foreground">
                                {item.displayName}
                              </p>
                              {item.department && (
                                <p className="text-[10px] text-muted-foreground">
                                  {item.department}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">
                              {item.reputation}
                            </span>
                            <span className="text-xs text-muted-foreground">reputation</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
