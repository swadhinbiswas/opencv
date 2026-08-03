import type { Metadata } from "next";
import { ProfileEditor } from "@/components/profile/profile-editor";

export const metadata: Metadata = { title: "Master Profile" };

export default function ProfilePage() {
  return <ProfileEditor />;
}