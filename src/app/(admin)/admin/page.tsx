"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { IUser } from "@/types/user";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldAlert, User as UserIcon } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4"];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<{
    categories: { name: string; value: number }[];
    departments: { name: string; total: number; resolved: number; avgRating: number }[];
    velocity: { month: string; days: number; issues: number }[];
  } | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchAnalytics();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/analytics");
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    // Basic prompt for extra info if authority
    let department = null;
    let jurisdiction = null;
    
    if (newRole === "authority") {
      department = prompt("Enter department (e.g. Traffic Police, Water Board):");
      jurisdiction = prompt("Enter jurisdiction/ward (e.g. Ward 42):");
      if (!department || !jurisdiction) {
        alert("Department and jurisdiction are required for authority users.");
        return;
      }
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole, department, jurisdiction }),
      });
      const data = await res.json();
      
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? data.data : u))
        );
      } else {
        alert(data.error || "Failed to update role");
      }
    } catch (error) {
      console.error("Failed to update role", error);
    }
  };

  if (loading) return <div className="p-8">Loading users...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage platform access, roles, and city-wide performance metrics.</p>
        </div>
      </div>

      {/* Analytics Panel */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart: Categories */}
          <Card className="col-span-1 border-border/50 bg-card/40 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Issue Distribution by Category</CardTitle>
              <CardDescription>Municipal reports sorted by category</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              {analytics.categories.length === 0 ? (
                <p className="text-muted-foreground text-xs">No issue data available</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.categories}
                      cx="50%"
                      cy="48%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {analytics.categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: "8px", color: "#f4f4f5" }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "10px" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Bar Chart: Departments */}
          <Card className="col-span-1 border-border/50 bg-card/40 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Department Performance & Loads</CardTitle>
              <CardDescription>Issues reported vs resolved</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              {analytics.departments.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground text-xs">No department analytics available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.departments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 9 }} />
                    <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: "8px", color: "#f4f4f5" }} />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                    <Bar dataKey="total" name="Total Issues" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Line Chart: Resolution Velocity */}
          <Card className="col-span-1 border-border/50 bg-card/40 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">City Resolution Velocity</CardTitle>
              <CardDescription>Average days to resolve month-over-month</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              {analytics.velocity.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground text-xs">No resolution velocity data yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.velocity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="month" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: "8px", color: "#f4f4f5" }} />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                    <Line type="monotone" dataKey="days" name="Avg Days to Resolve" stroke="#a855f7" strokeWidth={2} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>
            {users.length} registered users in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-surface text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 rounded-tl-lg">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4 text-right rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden">
                          {u.photoURL ? (
                            <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{u.displayName}</div>
                          <div className="text-muted-foreground text-xs">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant={u.role === "admin" ? "danger" : u.role === "authority" ? "info" : "default"}
                      >
                        {u.role === "admin" && <ShieldAlert className="w-3 h-3 mr-1" />}
                        {u.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {u.role === "authority" ? (
                        <div className="text-xs">
                          <span className="font-medium">Dept:</span> {u.department} <br/>
                          <span className="font-medium">Jurisdiction:</span> {u.jurisdiction}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== "admin" && (
                        <select
                          className="bg-surface border border-border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                          value={u.role}
                          onChange={(e) => updateRole(u._id, e.target.value)}
                        >
                          <option value="citizen">Citizen</option>
                          <option value="authority">Promote to Authority</option>
                          <option value="admin">Promote to Admin</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
