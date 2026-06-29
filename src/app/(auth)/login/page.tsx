"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleIcon } from "@/components/icons/google";

export default function LoginPage() {
  const { user, loading, loginWithGoogle } = useAuth();
  const router = useRouter();

  // If user is already logged in, redirect them or switch their role if they clicked a different portal
  useEffect(() => {
    const handleRedirect = async () => {
      if (user && !loading) {
        const searchParams = new URLSearchParams(window.location.search);
        const roleParam = searchParams.get("role");

        // Keep session storage updated for the sign-in flow
        if (roleParam) {
          sessionStorage.setItem("selected_role", roleParam);
        }

        // Only redirect to /admin if they did not explicitly request another role
        if (user.role === "admin" && !roleParam) {
          router.push("/admin");
          return;
        }

        // If they requested a specific role (citizen/authority) and it doesn't match their current role:
        if (roleParam && ["citizen", "authority"].includes(roleParam) && user.role !== roleParam) {
          try {
            const { auth } = await import("@/lib/firebase/config");
            const currentUser = auth.currentUser;
            if (currentUser) {
              const idToken = await currentUser.getIdToken(true);
              const res = await fetch("/api/auth/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken, targetRole: roleParam }),
              });
              const data = await res.json();
              if (data.success) {
                // Redirect directly to the correct dashboard
                window.location.href = roleParam === "authority" ? "/authority/dashboard" : "/citizen/dashboard";
                return;
              }
            } else {
              // Fallback: if Firebase client hasn't loaded currentUser yet, clear the session and force re-auth
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.reload();
              return;
            }
          } catch (err) {
            console.error("Failed to switch role silently:", err);
          }
        }

        // Default redirect
        if (user.role === "authority") {
          router.push("/authority/dashboard");
        } else {
          router.push("/citizen/dashboard");
        }
      }
    };

    handleRedirect();
  }, [user, loading, router]);

  const handleLogin = async () => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const roleParam = searchParams.get("role");
      if (roleParam) {
        sessionStorage.setItem("selected_role", roleParam);
      }
      await loginWithGoogle();
    } catch (error) {
      console.error("Failed to login", error);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-2xl font-bold text-white tracking-tighter">C</span>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold tracking-tight">
                Welcome to Civora
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                See. Understand. Resolve.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button
              variant="outline"
              size="xl"
              onClick={handleLogin}
              disabled={loading}
              className="w-full relative group overflow-hidden bg-surface hover:bg-surface/80 border-border/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-center justify-center gap-3 relative z-10">
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <>
                    <GoogleIcon className="w-5 h-5" />
                    <span className="font-medium text-foreground">Continue with Google</span>
                  </>
                )}
              </div>
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
