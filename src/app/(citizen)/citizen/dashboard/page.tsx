"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldAlert, LogOut, Plus, MapPin, BrainCircuit, CheckCircle, Clock, Map, Trophy } from "lucide-react";
import Link from "next/link";
import { IIssue } from "@/lib/db/models/issue.model";

export default function CitizenDashboard() {
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState<IIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "mine">("all");

  // Satisfaction rating modal state
  const [ratingIssueId, setRatingIssueId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [ratingSubmitting, setRatingSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchIssues(filter);
  }, [filter]);

  const handleRatingSubmit = async () => {
    if (!ratingIssueId) return;
    setRatingSubmitting(true);
    try {
      const res = await fetch(`/api/issues/${ratingIssueId}/satisfaction`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, feedback: feedbackText }),
      });
      const data = await res.json();
      if (data.success) {
        setIssues((prev) => prev.map((i) => String(i._id) === ratingIssueId ? data.data : i));
        setRatingIssueId(null);
        setRating(5);
        setFeedbackText("");
      } else {
        alert(data.error || "Failed to submit rating");
      }
    } catch (e) {
      console.error(e);
      alert("Error submitting satisfaction rating");
    } finally {
      setRatingSubmitting(false);
    }
  };

  const fetchIssues = async (currentFilter: "all" | "mine" = filter) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/issues/citizen?filter=${currentFilter}`);
      const data = await res.json();
      if (data.success) {
        setIssues(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch issues", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPromote = async (role: "authority" | "admin") => {
    try {
      const res = await fetch("/api/auth/demo-promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      
      const data = await res.json();
      if (data.success) {
        window.location.href = role === "admin" ? "/admin" : "/authority/dashboard";
      } else {
        alert(data.error || "Failed to switch role");
      }
    } catch (error) {
      console.error("Promotion error:", error);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Citizen Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.displayName}. Explore community reports.</p>
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
          className="pb-3 border-b-2 border-blue-500 font-semibold text-blue-400 flex items-center gap-1.5"
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
          className="pb-3 text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-border transition-all flex items-center gap-1.5"
        >
          <Trophy className="w-4 h-4" />
          Leaderboard
        </Link>
      </div>


      
      {/* Issues Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-2">
          <h2 className="text-xl font-semibold tracking-tight">Community Issues</h2>
          <div className="flex rounded-lg bg-surface/50 border border-border/50 p-1">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filter === "all"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Public Feed
            </button>
            <button
              onClick={() => setFilter("mine")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filter === "mine"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              My Reports
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[400px] rounded-xl bg-surface/50 border border-border" />
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl bg-surface/30">
            <p className="text-muted-foreground">
              {filter === "all" ? "No civic reports found in the community." : "You haven't reported any issues yet."}
            </p>
            {filter === "mine" && (
              <Link href="/report">
                <Button variant="outline" className="mt-4">Make your first report</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map((issue) => (
              <Card key={issue._id as string} className="overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm shadow-xl flex flex-col transition-all hover:border-primary/30">
                <div className="h-48 w-full bg-surface relative">
                  <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3">
                    <Badge variant={
                      issue.status === "Pending" ? "default" :
                      issue.status === "Verified" ? "info" :
                      issue.status === "In Progress" ? "warning" :
                      issue.status === "Resolved" ? "success" :
                      issue.status === "Closed" ? "secondary" : "danger"
                    } className={`shadow-lg backdrop-blur-md bg-opacity-90 ${issue.status === "Verification Failed" ? "bg-red-950 text-red-400 border border-red-500/20" : ""} ${issue.status === "Closed" ? "bg-zinc-800/80 text-zinc-400 border border-zinc-500/25" : ""}`}>
                      {issue.status}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg line-clamp-1">{issue.title}</h3>
                  </div>

                  {/* Reported By Name */}
                  <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                    <div className="w-4.5 h-4.5 rounded-full bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-400">
                      {issue.reportedBy && typeof issue.reportedBy === "object"
                        ? (issue.reportedBy as any).displayName?.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                    <span>
                      by{" "}
                      <span className="font-medium text-foreground">
                        {issue.reportedBy && typeof issue.reportedBy === "object"
                          ? (issue.reportedBy as any).displayName
                          : "Anonymous"}
                      </span>
                      {issue.reportedBy && typeof issue.reportedBy === "object" && (issue.reportedBy as any)._id === user?._id && " (You)"}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="line-clamp-1 max-w-[150px]">{issue.address}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Reported: {new Date(issue.createdAt).toLocaleDateString()}</span>
                    </span>
                    {issue.resolvedAt && (
                      <span className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        <span>Resolved: {new Date(issue.resolvedAt).toLocaleDateString()}</span>
                      </span>
                    )}
                    {issue.resolvedAt && (new Date(issue.resolvedAt).getTime() - new Date(issue.createdAt).getTime()) < 15 * 24 * 60 * 60 * 1000 && (
                      <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-500/20 text-[9px] py-0 px-1.5 font-normal">
                        ⚡ Solved Quickly
                      </Badge>
                    )}
                  </div>

                  {/* Resolution Proof for Citizen */}
                  {issue.resolvedImageUrl && (
                    <div className="mb-4 p-3 rounded-lg bg-surface/50 border border-border/50 text-xs space-y-2">
                      <div className="flex items-center justify-between text-foreground font-medium">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle className={`w-3.5 h-3.5 ${issue.status === "Verification Failed" ? "text-red-400" : "text-green-400"}`} />
                          Resolution Proof
                        </span>
                        <Badge variant={issue.status === "Verification Failed" ? "danger" : "success"} className="text-[9px] px-1.5 py-0">
                          {issue.status === "Verification Failed" ? "AI Rejected" : "AI Approved"}
                        </Badge>
                      </div>
                      <img src={issue.resolvedImageUrl} alt="Resolution" className="h-20 rounded object-cover w-full" />
                      {issue.aiAnalysis?.resolutionVerification?.reasoning && (
                        <p className="text-[11px] text-muted-foreground italic leading-relaxed pt-1 line-clamp-1" title={issue.aiAnalysis.resolutionVerification.reasoning}>
                          CORA: "{issue.aiAnalysis.resolutionVerification.reasoning}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Rating & Feedback display (if Closed) */}
                  {issue.status === "Closed" && (
                    <div className="mb-4 p-3 rounded-lg bg-emerald-950/10 border border-emerald-500/25 text-xs space-y-1">
                      <p className="text-foreground font-semibold flex items-center gap-1.5">
                        <span className="text-yellow-400 font-bold">★</span>
                        <span>Satisfaction Rating: {issue.citizenRating}/5</span>
                      </p>
                      {issue.citizenFeedback && (
                        <p className="text-muted-foreground italic">"{issue.citizenFeedback}"</p>
                      )}
                    </div>
                  )}

                  {/* Rate & Close action (if Resolved and reported by current user) */}
                  {issue.status === "Resolved" && issue.reportedBy && (issue.reportedBy as any)._id === user?._id && (
                    <Button
                      onClick={() => setRatingIssueId(issue._id as string)}
                      className="w-full mb-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2.5 text-xs font-semibold shadow-lg shadow-emerald-900/10"
                    >
                      Rate Resolution & Close
                    </Button>
                  )}
                  
                  {/* AI Analysis Block */}
                  <div className="mt-auto bg-surface/50 rounded-lg p-3 border border-border/50 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <BrainCircuit className="w-3.5 h-3.5" />
                      CORA Analysis
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                      <div>
                        <span className="font-medium text-foreground">Category:</span><br/>
                        {issue.category}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Severity:</span><br/>
                        <span className={issue.severity === "Critical" ? "text-danger" : issue.severity === "High" ? "text-warning" : ""}>
                          {issue.severity}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium text-foreground">Routed To:</span><br/>
                        {issue.department}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Satisfaction Rating Modal */}
      {ratingIssueId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md border-border bg-card shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-emerald-400">
                <span>★</span>
                Rate Resolution & Close
              </CardTitle>
              <CardDescription>
                Let us know if you are satisfied with how the authority resolved this issue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Star Selection */}
              <div className="flex justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                  >
                    <span className={star <= rating ? "text-yellow-400" : "text-zinc-600"}>
                      ★
                    </span>
                  </button>
                ))}
              </div>

              {/* Feedback Text */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Optional Feedback Comment</label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tell us what you think of the resolution..."
                  className="w-full min-h-[80px] rounded-lg border border-border bg-surface p-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setRatingIssueId(null);
                    setRating(5);
                    setFeedbackText("");
                  }}
                  disabled={ratingSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleRatingSubmit}
                  disabled={ratingSubmitting}
                >
                  {ratingSubmitting ? "Submitting..." : "Close Complaint"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
