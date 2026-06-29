"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Shield, BrainCircuit, Navigation, Activity, ArrowRight, Camera, CheckCircle, FileText } from "lucide-react";
import Link from "next/link";
import { GoogleIcon } from "@/components/icons/google";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleCTA = () => {
    if (!user) router.push("/login");
    else if (user.role === "admin") router.push("/admin");
    else if (user.role === "authority") router.push("/authority/dashboard");
    else router.push("/citizen/dashboard");
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden selection:bg-primary/30">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-xl font-bold text-white tracking-tighter">C</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Civora</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="https://github.com" target="_blank" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              GitHub
            </Link>
            <Button onClick={handleCTA} variant={user ? "outline" : "default"} size="sm">
              {loading ? "Loading..." : user ? "Dashboard" : "Sign In"}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-56 lg:pb-40 px-6">
        {/* Abstract Background - Google Inspired Glassmorphism */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[1000px] sm:h-[1000px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none opacity-60" />
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none opacity-60" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-10"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 bg-surface/50 backdrop-blur-md text-foreground text-sm font-medium shadow-sm">
              <GoogleIcon className="w-4 h-4" />
              <span>Civora — Powered by Google</span>
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter">
              See. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Understand.</span> Resolve.
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
              Empowering communities with AI-driven civic intelligence. 
              Report issues in seconds, let CORA instantly route them to the right authorities, and track resolution transparently.
            </motion.p>
            
            <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto pt-8">
              {/* Citizen Portal */}
              <div className="p-6 rounded-2xl border border-border/50 bg-surface/30 backdrop-blur-md text-left flex flex-col justify-between hover:border-blue-500/50 hover:bg-surface/50 transition-all duration-300">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 border border-blue-500/20">
                    <span className="text-lg font-bold">C</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Citizen Portal</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    Report community issues (potholes, streetlights, garbage), track resolutions in real-time, and build civic reputation.
                  </p>
                </div>
                <Button onClick={() => router.push("/login?role=citizen")} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 shadow-lg shadow-blue-900/10">
                  Continue as Citizen
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Authority Portal */}
              <div className="p-6 rounded-2xl border border-border/50 bg-surface/30 backdrop-blur-md text-left flex flex-col justify-between hover:border-purple-500/50 hover:bg-surface/50 transition-all duration-300">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 border border-purple-500/20">
                    <span className="text-lg font-bold">A</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Authority Portal</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    Access department-specific dashboard, view assigned complaints, and resolve them by uploading proof of fix.
                  </p>
                </div>
                <Button onClick={() => router.push("/login?role=authority")} className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-6 border-0 shadow-lg shadow-purple-900/10">
                  Continue as Authority
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 relative z-10 border-t border-border/50 bg-surface/30">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Meet CORA</h2>
            <p className="text-muted-foreground text-lg">
              The Civic Operations & Resolution Assistant that acts as the intelligence layer between citizens and municipal authorities.
            </p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: BrainCircuit,
                title: "AI Classification",
                desc: "CORA analyzes photos and descriptions to instantly categorize issues (e.g. Pothole, Lighting).",
                color: "text-blue-400"
              },
              {
                icon: Shield,
                title: "Duplicate Detection",
                desc: "Prevents spam by mathematically merging similar reports in the same geographic radius.",
                color: "text-purple-400"
              },
              {
                icon: Navigation,
                title: "Smart Routing",
                desc: "Automatically identifies the correct municipal department based on category and jurisdiction.",
                color: "text-emerald-400"
              },
              {
                icon: Activity,
                title: "Severity Scoring",
                desc: "Assigns urgency scores based on safety hazards, ensuring critical issues are resolved first.",
                color: "text-rose-400"
              }
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeIn}>
                <Card className="h-full bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-colors border-border/50">
                  <CardContent className="p-6 space-y-4">
                    <div className={`w-12 h-12 rounded-lg bg-surface flex items-center justify-center border border-border/50 ${feature.color}`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Four Steps to Resolution</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", icon: Camera, title: "Snap a Photo", desc: "Citizen takes a picture of the issue." },
              { step: "02", icon: BrainCircuit, title: "AI Analysis", desc: "CORA validates and routes the report." },
              { step: "03", icon: FileText, title: "Authority Action", desc: "Department receives actionable data." },
              { step: "04", icon: CheckCircle, title: "Resolution", desc: "Issue fixed, citizen gains reputation." },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="text-6xl font-bold text-surface mb-4 group-hover:text-primary/20 transition-colors">
                  {item.step}
                </div>
                <div className="space-y-2">
                  <item.icon className="w-6 h-6 text-primary mb-3" />
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50 text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} Civora Platform. Built for the Hackathon.</p>
      </footer>
    </div>
  );
}
