"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/store/session";
import { firebaseConfigured } from "@/lib/auth/firebase-client";

const schema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    email: z.string().trim().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.confirm !== undefined && data.password !== data.confirm) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["confirm"], message: "Passwords do not match" });
    }
  });

type FormValues = z.infer<typeof schema>;

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { login, signup } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const isSignup = mode === "signup";

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { confirm: isSignup ? "" : undefined },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      if (isSignup) {
        await signup({ email: values.email, password: values.password, name: values.name ?? "" });
      } else {
        await login({ email: values.email, password: values.password });
      }
      // Only navigate once the session store confirms the cookie stuck.
      if (useSession.getState().status !== "authenticated") {
        throw new Error("Sign-in succeeded but the session did not persist. Please try again.");
      }
      // Hard navigation so the server (proxy + layout) reads the fresh cookie.
      window.location.assign("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const onGoogle = async () => {
    if (!firebaseConfigured()) {
      toast.info("Google sign-in is enabled once Firebase is configured. Use email for now.");
      return;
    }
    setSubmitting(true);
    let auth: import("firebase/auth").Auth = undefined!;
    let provider: import("firebase/auth").GoogleAuthProvider = undefined!;
    let signInWithRedirect: (typeof import("firebase/auth"))["signInWithRedirect"] = undefined!;
    try {
      const { firebaseAuth } = await import("@/lib/auth/firebase-client");
      const firebaseAuthMod = await import("firebase/auth");
      const { GoogleAuthProvider, signInWithPopup } = firebaseAuthMod;
      signInWithRedirect = firebaseAuthMod.signInWithRedirect;
      auth = firebaseAuth();
      provider = new GoogleAuthProvider();
      // Popup first: some browsers (Brave Shields, Firefox strict) abort the
      // full-page redirect to the Firebase handler (net::ERR_ABORTED), which
      // makes signInWithRedirect hang silently. A user-gesture popup is allowed.
      const cred = await signInWithPopup(auth, provider);
      const idToken = await cred.user.getIdToken();
      const { api } = await import("@/lib/http");
      await api.post<{ ok: boolean }>("/api/auth/login", { idToken });
      await useSession.getState().refresh();
      if (useSession.getState().status !== "authenticated") {
        throw new Error("Google sign-in succeeded but the session did not persist.");
      }
      window.location.assign("/dashboard");
    } catch (err) {
      const code = err instanceof Error ? (err as Error & { code?: string }).code : undefined;
      if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request" || code === "auth/operation-not-supported-in-this-environment") {
        // Popup blocked — fall back to the redirect flow (completes on the
        // callback page via getRedirectResult).
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr) {
          console.error(redirectErr);
          toast.error("Could not start Google sign-in");
        }
      } else if (code !== "auth/popup-closed-by-user") {
        console.error(err);
        toast.error("Could not complete Google sign-in");
      }
      setSubmitting(false);
    }
  };

  // Once-guard so React StrictMode's simulated remount doesn't start two
  // getRedirectResult() races. The first invocation consumes the pending
  // redirect; the second would get null and silently abort the whole flow.
  const googleRedirectHandled = useRef(false);

  useEffect(() => {
    if (!firebaseConfigured()) return;
    if (googleRedirectHandled.current) return;
    googleRedirectHandled.current = true;
    (async () => {
      try {
        const { firebaseAuth } = await import("@/lib/auth/firebase-client");
        const { getRedirectResult } = await import("firebase/auth");
        const auth = firebaseAuth();
        const cred = await getRedirectResult(auth);
        if (!cred) {
          // A redirect callback arrived but nothing was pending — surface it
          // instead of silently leaving the user on the login page.
          if (window.location.hash.includes("firebase:redirect") || window.location.hash.includes("auth/handler")) {
            throw new Error("Google sign-in could not be completed. Please try again.");
          }
          return;
        }
        const idToken = await cred.user.getIdToken();
        const { api } = await import("@/lib/http");
        await api.post<{ ok: boolean }>("/api/auth/login", { idToken });
        await useSession.getState().refresh();
        if (useSession.getState().status !== "authenticated") {
          throw new Error("Google sign-in succeeded but the session did not persist.");
        }
        window.location.assign("/dashboard");
      } catch (err) {
        console.error(err);
        toast.error("Could not complete Google sign-in");
        // Allow a retry on the next render.
        googleRedirectHandled.current = false;
      }
    })();
  }, [router]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isSignup && (
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="Alex Rivera" autoComplete="name" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@company.com" autoComplete="email" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      {isSignup && (
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" type="password" autoComplete="new-password" {...register("confirm")} />
          {errors.confirm && <p className="text-xs text-destructive">{errors.confirm.message}</p>}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSignup ? "Create account" : "Sign in"}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or</span></div>
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={onGoogle} disabled={submitting}>
        Continue with Google
      </Button>

      {!firebaseConfigured() && (
        <p className="text-center text-xs text-muted-foreground">
          Development mode — email accounts are stored locally.
        </p>
      )}
    </form>
  );
}