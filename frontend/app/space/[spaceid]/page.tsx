import type { Metadata } from "next";
import { ChatInterface } from "@/components/ChatInterface";

interface SpacePageProps {
    spaceid: string
}

export const metadata: Metadata = {
    title: "Document Space",
    description: "Private PaperTalk chat workspace for document analysis.",
    robots: {
        index: false,
        follow: false,
        googleBot: {
            index: false,
            follow: false,
        },
    },
}

async function SpacePage({ params }: { params: Promise<SpacePageProps> }) {

    const { spaceid } = await params;
    return <ChatInterface spaceid={spaceid as string} />;
}

export default SpacePage
