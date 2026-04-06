"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { LoginModal } from "./LoginModal";
import { useToast } from "@/context/ToastContext";
import type { AuthHook } from "@/hooks/useAuth";

interface AuthButtonProps {
  auth: AuthHook;
}

export function AuthButton({ auth }: AuthButtonProps) {
  const [loginOpen, setLoginOpen] = useState(false);
  const { toast } = useToast();

  if (auth.isLoading) return null;

  if (auth.user) {
    return (
      <Button
        variant="ghost"
        color="subtle"
        size="sm"
        onClick={async () => {
          await auth.signOut();
          toast({ variant: "success", title: "Successfully logged out" });
        }}
      >
        Log out
      </Button>
    );
  }

  return (
    <>
      <Button variant="outline" color="primary" size="sm" onClick={() => setLoginOpen(true)}>
        Log in
      </Button>
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSignIn={auth.signIn}
        onVerifyOtp={auth.verifyOtp}
      />
    </>
  );
}
