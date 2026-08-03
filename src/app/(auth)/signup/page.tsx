import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Create your free CV — OpenCV Resume Builder",
  description:
    "Create a free account with OpenCV and build a professional, ATS-friendly CV or resume in minutes. 12+ templates, matching cover letters and instant PDF download.",
};

export default function SignupPage() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">Build your career profile once — tailor it forever.</p>
      </div>
      <div className="mt-6">
        <AuthForm mode="signup" />
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}