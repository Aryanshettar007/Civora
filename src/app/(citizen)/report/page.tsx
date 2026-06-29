"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { uploadImage } from "@/lib/firebase/storage";
import { UploadCloud, BrainCircuit, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LocationPicker from "@/components/maps/LocationPicker";

export default function ReportIssuePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingState, setLoadingState] = useState<"uploading" | "analyzing" | "done" | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleLocationSelect = useCallback((loc: { lat: number; lng: number }, addr: string) => {
    setLocation(loc);
    setAddress(addr);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !description || !location) {
      alert("Please fill all fields, upload an image, and pick a location on the map.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Upload to ImgBB
      setLoadingState("uploading");
      const imageUrl = await uploadImage(file);

      // 2. Call API to analyze with CORA and save
      setLoadingState("analyzing");
      
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          address,
          location,
          imageUrl
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setLoadingState("done");
        setTimeout(() => {
          router.push("/citizen/dashboard");
        }, 1500);
      } else {
        alert(data.error || "Failed to submit issue");
        setIsSubmitting(false);
        setLoadingState(null);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during submission.");
      setIsSubmitting(false);
      setLoadingState(null);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Report an Issue</h1>
        <p className="text-muted-foreground">CORA will analyze your report and route it instantly.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Photo */}
        <Card className="border-border/50 bg-surface/50 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle>1. Upload Photo</CardTitle>
            <CardDescription>A clear picture helps authorities locate and resolve the issue faster.</CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                previewUrl ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-surface"
              }`}
            >
              {previewUrl ? (
                <div className="space-y-4">
                  <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg object-contain" />
                  <p className="text-sm text-primary font-medium">Click to change photo</p>
                </div>
              ) : (
                <div className="space-y-4 py-8">
                  <div className="mx-auto w-12 h-12 rounded-full bg-surface flex items-center justify-center">
                    <UploadCloud className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG or GIF (max 5MB)</p>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Details */}
        <Card className="border-border/50 bg-surface/50 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle>2. Issue Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input 
                placeholder="e.g. Deep pothole on Main Street" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea 
                className="w-full min-h-[100px] rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="Describe the issue, any safety hazards, etc..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Location via Google Maps */}
        <Card className="border-border/50 bg-surface/50 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle>3. Pin Location</CardTitle>
            <CardDescription>Search or click the map to pin the exact location of the issue.</CardDescription>
          </CardHeader>
          <CardContent>
            <LocationPicker onLocationSelect={handleLocationSelect} />
          </CardContent>
        </Card>

        {/* Submit */}
        <AnimatePresence mode="wait">
          {!isSubmitting ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Button type="submit" size="xl" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20">
                Submit Report to CORA
              </Button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 rounded-xl border border-primary/20 bg-primary/5 space-y-4">
              <div className="flex items-center gap-4">
                {loadingState === "done" ? (
                  <BrainCircuit className="w-6 h-6 text-success" />
                ) : (
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                )}
                <div className="space-y-1">
                  <p className="font-medium text-primary">
                    {loadingState === "uploading" && "Uploading image..."}
                    {loadingState === "analyzing" && "CORA is analyzing the issue..."}
                    {loadingState === "done" && "Issue reported successfully! Redirecting..."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {loadingState === "analyzing" && "Running AI visual classification, severity scoring, and department routing"}
                  </p>
                </div>
              </div>
              {loadingState === "analyzing" && (
                <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-pulse w-full origin-left" style={{ animationDuration: "2s" }} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
