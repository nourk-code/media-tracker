"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/hooks/useSession";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ExternalLink, User } from "lucide-react";
import Link from "next/link";
import type { Profile } from "@/lib/types/collection";

export default function SettingsPage() {
  const { user } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          const p = data as Profile;
          setProfile(p);
          setDisplayName(p.display_name ?? "");
          setUsername(p.username ?? "");
          setIsPublic(p.is_public ?? true);
        }
      });
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName, username, is_public: isPublic })
        .eq("id", user.id);
      if (error) throw error;
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

      <div className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            Profile
          </h2>

          <div className="space-y-1.5">
            <Label className="text-gray-300">Display Name</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              placeholder="Your display name"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-gray-300">Username</Label>
            <div className="flex gap-2 items-center">
              <Input
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                  )
                }
                className="bg-white/5 border-white/10 text-white"
                placeholder="username"
              />
              {profile?.username && (
                <Link
                  href={`/profile/${profile.username}`}
                  target="_blank"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              )}
            </div>
            <p className="text-gray-600 text-xs">
              Your public profile: /profile/{username || "username"}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Public Profile</Label>
              <p className="text-gray-600 text-xs mt-0.5">
                Allow anyone to view your collection
              </p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
        </div>

        {/* Account info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Account</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Email</span>
              <span className="text-white text-sm">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Provider</span>
              <span className="text-white text-sm capitalize">
                {user?.app_metadata?.provider ?? "Google"}
              </span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
