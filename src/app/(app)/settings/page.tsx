import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { getUserInfo } from "@/lib/account/service";
import { AccountActions } from "@/components/settings/account-actions";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await getSession();
  const info = session ? await getUserInfo(session.userId) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <div className="mt-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
            <CardDescription>Your account details and data controls.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b pb-3">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{info?.email ?? "—"}</span>
            </div>
            <div className="flex justify-between gap-4 border-b pb-3">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{info?.name || "—"}</span>
            </div>
            <div className="flex justify-between gap-4 border-b pb-3">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium capitalize">{info?.plan ?? "free"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Member since</span>
              <span className="font-medium">{info?.createdAt ? new Date(info.createdAt).toLocaleDateString() : "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data</CardTitle>
            <CardDescription>
              Export a full copy of your data, or permanently delete your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccountActions />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
