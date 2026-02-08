"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Mail, Lock, Chrome } from "lucide-react";
import {
  signInWithEmailAndPassword,
  sendSignInLinkToEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error: any) {
      let errorMessage = "Failed to sign in with Google. Please try again.";

      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in was canceled.";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup was blocked. Please allow popups and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error: any) {
      let errorMessage = "Failed to sign in. Please try again.";
      
      if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "This account has been disabled.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordlessSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Store email in localStorage before sending (as per Firebase docs)
      window.localStorage.setItem("emailForSignIn", email);
      
      const actionCodeSettings = {
        url: `${window.location.origin}/login?email=${encodeURIComponent(email)}`,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
      setMessage({
        type: "success",
        text: "Check your email! We've sent you a sign-in link.",
      });
    } catch (error: any) {
      let errorMessage = "Failed to send sign-in link. Please try again.";
      
      if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/configuration-not-found") {
        errorMessage = "Email link sign-in is not configured. Please enable it in Firebase Console.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {!isLoading && <Chrome className="mr-2 h-4 w-4" />}
          Continue with Google
        </Button>
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or sign in with email
          <span className="h-px flex-1 bg-border" />
        </div>
      </div>
      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Password
          </TabsTrigger>
          <TabsTrigger value="passwordless" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Link
          </TabsTrigger>
        </TabsList>

        <TabsContent value="password" className="space-y-6 mt-6">
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email-password">Email</Label>
              <Input
                id="email-password"
                type="email"
                placeholder="name@family.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a
                  href="/forgot-password"
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="passwordless" className="space-y-6 mt-6">
          <form onSubmit={handlePasswordlessSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email-passwordless">Email</Label>
              <Input
                id="email-passwordless"
                type="email"
                placeholder="name@family.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                We'll send you a secure link to sign in without a password.
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Sending..." : "Send Sign-In Link"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <div className="text-center text-sm">
        Don't have an account?{" "}
        <a href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign up
        </a>
      </div>
    </div>
  );
}
