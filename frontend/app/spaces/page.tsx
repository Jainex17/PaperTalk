import type { Metadata } from "next";
import { SpacesList } from '@/components/SpacesList';

export const metadata: Metadata = {
  title: "Spaces",
  description: "Private PaperTalk document spaces for signed-in users.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function SpacesPage() {
  return <SpacesList />;
}
