import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sign in to OpenCV — Resume Builder & CV Maker",
  description:
    "Sign in to OpenCV and continue building your free professional CV, resume or cover letter. Your master profile, templates and PDF downloads are saved securely.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to manage your CVs and applications.</p>
      </div>
      <div className="mt-6">
        <AuthForm mode="login" />
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}