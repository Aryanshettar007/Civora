"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { uploadImage } from "@/lib/firebase/storage";
import {
  LogOut, MapPin, BrainCircuit, CheckCircle, Clock, AlertTriangle,
  ImagePlus, Loader2, Building2, ChevronLeft
} from "lucide-react";

const DEPT_MAP: Record<string, string> = {
  "public-works": "Public Works",
  "sanitation": "Sanitation Dept",
  "water-board": "Water Board",
  "electricity-board": "Electricity Board",
  "police-safety": "Police/Safety",
};

export default function DepartmentDashboard({ params }: { params: { deptSlug: string } }) {
  const router = useRouter();
  const deptName = DEPT_MAP[params.deptSlug] || "Public Works";

  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Resolve modal state
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolveFile, setResolveFile] = useState<File | null>(null);
  const [resolvePreview, setResolvePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchIssues();
  }, [params.deptSlug]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/issues/department?dept=${encodeURIComponent(deptName)}`);
      const data = await res.json();
      if (data.success) {
        const severityWeight: Record<string, number> = {
          "Critical": 4,
          "High": 3,
          "Medium": 2,
          "Low": 1
        };
        const sorted = data.data.sort((a: any, b: any) => {
          const wA = severityWeight[a.severity] || 0;
          const wB = severityWeight[b.severity] || 0;
          if (wA !== wB) return wB - wA;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setIssues(sorted);
      }
    } catch (error) {
      console.error("Failed to fetch issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (issueId: string, status: string) => {
    if (status === "Resolved") {
      setResolvingId(issueId);
      return;
    }

    try {
      const res = await fetch(`/api/issues/${issueId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setIssues((prev) => prev.map((i) => (i._id === issueId ? data.data : i)));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleResolveSubmit = async () => {
    if (!resolveFile || !resolvingId) {
      alert("Please upload a resolution image first.");
      return;
    }

    setSubmitting(true);
    try {
      const imageUrl = await uploadImage(resolveFile);

      const res = await fetch(`/api/issues/${resolvingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Resolved", resolvedImageUrl: imageUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setIssues((prev) => prev.map((i) => (i._id === resolvingId ? data.data : i)));
        setResolvingId(null);
        setResolveFile(null);
        setResolvePreview(null);
      } else {
        alert(data.error || "Failed to resolve issue");
      }
    } catch (error) {
      console.error(error);
      alert("Error resolving issue");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResolveFile(e.target.files[0]);
      setResolvePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "text-red-400";
      case "High": return "text-orange-400";
      case "Medium": return "text-yellow-400";
      default: return "text-green-400";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending": return "default";
      case "Verified": return "info";
      case "In Progress": return "warning";
      case "Resolved": return "success";
      case "Rejected": return "danger";
      case "Verification Failed": return "danger";
      case "Closed": return "secondary";
      default: return "default";
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header / Nav */}
      <div className="flex justify-between items-center">
        <Button 
          onClick={() => router.push("/authority/dashboard")}
          variant="outline" 
          size="sm"
          className="border-border/50 hover:bg-surface/50 rounded-lg"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Overview
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{deptName} Dashboard</h1>
            <p className="text-muted-foreground">Manage and resolve active complaints for {deptName}.</p>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-surface/50 border border-border animate-pulse" />
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl bg-surface/30">
            <p className="text-muted-foreground">No active issues assigned to {deptName}.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => (
              <Card key={issue._id} className="border-border/50 bg-card/40 backdrop-blur-sm shadow-lg overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Issue Image */}
                  <div className="w-full md:w-48 h-48 md:h-auto flex-shrink-0 bg-surface relative">
                    <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2">
                      <Badge variant={getStatusBadge(issue.status) as any} className="shadow-lg">
                        {issue.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Issue Details */}
                  <div className="flex-1 p-5 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{issue.title}</h3>
                      <span className={`text-sm font-semibold ${getSeverityColor(issue.severity)}`}>
                        {issue.severity}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{issue.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${issue.location.lat},${issue.location.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-500 hover:underline"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        {issue.address}
                      </a>
                      <span className="flex items-center gap-1" title="Date Reported">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Reported: {new Date(issue.createdAt).toLocaleDateString()}</span>
                      </span>
                      {issue.resolvedAt && (
                        <span className="flex items-center gap-1" title="Date Resolved">
                          <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                          <span>Resolved: {new Date(issue.resolvedAt).toLocaleDateString()}</span>
                        </span>
                      )}
                      {issue.resolvedAt && (new Date(issue.resolvedAt).getTime() - new Date(issue.createdAt).getTime()) < 15 * 24 * 60 * 60 * 1000 && (
                        <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-500/20 text-[10px] py-0 px-2">
                          ⚡ Solved Quickly
                        </Badge>
                      )}
                    </div>

                    {/* AI Analysis */}
                    <div className="flex items-center gap-2 text-xs text-primary mb-4">
                      <BrainCircuit className="w-3.5 h-3.5" />
                      <span className="font-medium">CORA:</span>
                      <span className="text-muted-foreground">{issue.aiAnalysis?.reasoning}</span>
                    </div>

                    {/* Resolved Image (if resolved or failed or closed) */}
                    {issue.resolvedImageUrl && (
                      <div className={`mb-4 p-3 rounded-lg border text-xs ${issue.status === "Verification Failed" ? "bg-red-950/20 border-red-500/30" : "bg-success/10 border-success/30"}`}>
                        <p className={`text-xs font-medium mb-2 flex items-center gap-1 ${issue.status === "Verification Failed" ? "text-danger" : "text-success"}`}>
                          <CheckCircle className="w-3.5 h-3.5" />
                          Resolution Proof ({issue.status === "Verification Failed" ? "AI Rejected" : issue.status === "Closed" ? "Closed" : "AI Approved"})
                        </p>
                        <img src={issue.resolvedImageUrl} alt="Resolved" className="h-24 rounded-lg object-cover mb-2" />
                        {issue.aiAnalysis?.resolutionVerification?.reasoning && (
                          <p className="text-[11px] text-muted-foreground italic leading-relaxed line-clamp-1" title={issue.aiAnalysis.resolutionVerification.reasoning}>
                            CORA: "{issue.aiAnalysis.resolutionVerification.reasoning}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* Citizen Satisfaction Feedback (if Closed) */}
                    {issue.status === "Closed" && (
                      <div className="mb-4 p-3 rounded-lg bg-emerald-950/10 border border-emerald-500/20 text-xs space-y-1">
                        <p className="text-foreground font-semibold flex items-center gap-1">
                          <span className="text-yellow-400">★</span>
                          Citizen Satisfaction Rating: {issue.citizenRating}/5
                        </p>
                        {issue.citizenFeedback && (
                          <p className="text-muted-foreground italic">Feedback: "{issue.citizenFeedback}"</p>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 mt-auto">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${issue.location.lat},${issue.location.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                        >
                          <MapPin className="w-3.5 h-3.5 mr-1" />
                          Navigate
                        </Button>
                      </a>

                      {issue.status !== "Resolved" && issue.status !== "Rejected" && issue.status !== "Closed" && (
                        <>
                          {issue.status === "Pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                              onClick={() => handleStatusChange(issue._id, "In Progress")}
                            >
                              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                              Take Up
                            </Button>
                          )}
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleStatusChange(issue._id, "Resolved")}
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Mark Resolved
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── Resolve Modal (requires image upload) ── */}
      {resolvingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md border-border bg-card shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Resolve Issue
              </CardTitle>
              <CardDescription>
                Upload a photo proving the issue has been fixed. This is required.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  resolvePreview ? "border-green-500/50 bg-green-500/5" : "border-border hover:border-green-500/50 hover:bg-surface"
                }`}
              >
                {resolvePreview ? (
                  <div className="space-y-3">
                    <img src={resolvePreview} alt="Resolution proof" className="max-h-48 mx-auto rounded-lg object-contain" />
                    <p className="text-sm text-green-400 font-medium">Click to change photo</p>
                  </div>
                ) : (
                  <div className="space-y-3 py-4">
                    <ImagePlus className="w-10 h-10 mx-auto text-muted-foreground" />
                    <p className="text-sm font-medium">Upload resolution proof</p>
                    <p className="text-xs text-muted-foreground">Photo showing the issue has been fixed</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleResolveFileSelect}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setResolvingId(null);
                    setResolveFile(null);
                    setResolvePreview(null);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleResolveSubmit}
                  disabled={!resolveFile || submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resolving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm Resolution
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
