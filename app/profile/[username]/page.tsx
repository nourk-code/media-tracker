import { createClient } from "@/lib/supabase/server";
import { getProfileByUsername, getPublicCollection } from "@/lib/supabase/queries";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { MediaGrid } from "@/components/media/MediaGrid";
import { ShareButton } from "@/components/profile/ShareButton";
import { Library, CheckCircle, Eye } from "lucide-react";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username}'s Collection | MediaVault`,
    description: `Check out ${username}'s media collection on MediaVault`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const supabase = await createClient();

  const profile = await getProfileByUsername(supabase, username);

  if (!profile || !profile.is_public) {
    notFound();
  }

  const collection = await getPublicCollection(supabase, profile.id);

  const completed = collection.filter((i) => i.status === "completed").length;
  const watching = collection.filter(
    (i) => i.status === "currently_watching"
  ).length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0d0d14]">
        <div className="max-w-6xl mx-auto px-8 py-10">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-indigo-600/20 flex-shrink-0">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-indigo-400">
                    {profile.username[0].toUpperCase()}
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white">
                  {profile.display_name ?? profile.username}
                </h1>
                <p className="text-gray-500 text-sm">@{profile.username}</p>
                {profile.bio && (
                  <p className="text-gray-300 text-sm mt-2 max-w-xl">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            <ShareButton />
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Library className="w-4 h-4" />
              <span>
                <strong className="text-white">{collection.length}</strong>{" "}
                items
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              <span>
                <strong className="text-white">{completed}</strong> completed
              </span>
            </div>
            {watching > 0 && (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Eye className="w-4 h-4 text-green-400" />
                <span>
                  <strong className="text-white">{watching}</strong> watching
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collection */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <h2 className="text-lg font-semibold text-white mb-6">
          {profile.display_name ?? profile.username}&apos;s Collection
        </h2>
        <MediaGrid
          items={collection}
          readOnly
          emptyMessage="This collection is empty."
        />
      </div>
    </div>
  );
}
