"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LogOut, Building2, LayoutGrid, CheckCircle, Clock, AlertTriangle, ArrowRight,
  TrendingUp, Activity, Inbox
} from "lucide-react";
import { useRouter } from "next/navigation";

const DEPARTMENTS = [
  { name: "Public Works", slug: "public-works", desc: "Roads, sidewalks, potholes, and municipal structural fixes." },
  { name: "Sanitation Dept", slug: "sanitation", desc: "Waste collection, littering, overflowing bins, and public cleanliness." },
  { name: "Water Board", slug: "water-board", desc: "Water supply pipes, drainage, leaks, and sewage issues." },
  { name: "Electricity Board", slug: "electricity-board", desc: "Streetlights, hanging cables, transformers, and electrical hazards." },
  { name: "Police/Safety", slug: "police-safety", desc: "Public safety hazards, blocking, traffic signs, and community protection." },
];

export default function AuthorityDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/authority/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDeptCount = (deptName: string, status: "Pending" | "In Progress" | "Resolved") => {
    return stats?.departments?.[deptName]?.[status] || 0;
  };

  const getDeptTotal = (deptName: string) => {
    return stats?.departments?.[deptName]?.Total || 0;
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/30">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Authority Portal</h1>
            <p className="text-muted-foreground">City-wide overall civic reports & department stats.</p>
          </div>
        </div>
        <Button onClick={logout} variant="ghost" size="sm" className="text-muted-foreground">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Overview Stats */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-surface/50 border border-border" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-md">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <h3 className="text-2xl font-bold">{stats?.overall?.Total || 0}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-md">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending AI Check</p>
                <h3 className="text-2xl font-bold">{stats?.overall?.Pending || 0}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-md">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <h3 className="text-2xl font-bold">{stats?.overall?.["In Progress"] || 0}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-md">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolved Issues</p>
                <h3 className="text-2xl font-bold">{stats?.overall?.Resolved || 0}</h3>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Department Cards Grid */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Municipal Departments</h2>
          <p className="text-muted-foreground">Select a department to view detailed issues and submit resolution updates.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEPARTMENTS.map((dept) => {
            const total = getDeptTotal(dept.name);
            const pending = getDeptCount(dept.name, "Pending");
            const active = getDeptCount(dept.name, "In Progress");
            const resolved = getDeptCount(dept.name, "Resolved");

            return (
              <Card 
                key={dept.slug}
                onClick={() => router.push(`/authority/dashboard/${dept.slug}`)}
                className="border-border/50 bg-card/40 hover:bg-card/60 hover:border-blue-500/30 transition-all shadow-lg cursor-pointer group flex flex-col justify-between"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Building2 className="w-5 h-5" />
                    </div>
                    {total > 0 && (
                      <Badge variant="info">
                        {total} total
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl pt-2">{dept.name}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">{dept.desc}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-border/40 text-center mb-4">
                    <div>
                      <p className="text-lg font-bold text-orange-400">{pending}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Pending</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-yellow-400">{active}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Active</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-400">{resolved}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Resolved</p>
                    </div>
                  </div>
                  <div className="flex justify-end items-center text-sm font-semibold text-blue-400 group-hover:text-blue-500 transition-colors">
                    Manage Issues
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
