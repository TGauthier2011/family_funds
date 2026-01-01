"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export function EmailLinkHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailLink, setIsEmailLink] = useState(false);

  useEffect(() => {
    const checkAndHandleEmailLink = async () => {
      // Check if this is an email link sign-in
      const isLink = isSignInWithEmailLink(auth, window.location.href);
      setIsEmailLink(isLink);

      if (!isLink) {
        return;
      }

      setIsProcessing(true);
      
      // Get the email from localStorage or URL
      let email = window.localStorage.getItem("emailForSignIn");
      if (!email) {
        // If email is not in localStorage, try to get it from URL
        email = searchParams.get("email") || "";
      }

      if (!email) {
        setError("Please enter your email address to complete sign-in.");
        setIsProcessing(false);
        return;
      }

      try {
        // Sign in with the email link
        await signInWithEmailLink(auth, email, window.location.href);
        
        // Clear the email from storage
        window.localStorage.removeItem("emailForSignIn");
        
        // Redirect to dashboard
        router.push("/dashboard");
      } catch (error: any) {
        let errorMessage = "Failed to sign in. The link may have expired.";
        
        if (error.code === "auth/invalid-email") {
          errorMessage = "Invalid email address.";
        } else if (error.code === "auth/invalid-action-code") {
          errorMessage = "This sign-in link has expired or has already been used.";
        } else if (error.message) {
          errorMessage = error.message;
        }

        setError(errorMessage);
        setIsProcessing(false);
      }
    };

    checkAndHandleEmailLink();
  }, [router, searchParams]);

  if (!isEmailLink) {
    return null;
  }

  if (isProcessing) {
    return (
      <Alert className="mb-4">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <AlertDescription>Completing sign-in...</AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return null;
}
