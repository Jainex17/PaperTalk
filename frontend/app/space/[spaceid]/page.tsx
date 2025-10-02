import { ChatInterface } from "@/app/components/ChatInterface";

interface SpacePageProps {
    spaceid: String
}

async function SpacePage({ params }: { params: Promise<SpacePageProps> }) {

    const { spaceid } = await params;
    return(
        <ChatInterface />
    )
}

export default SpacePage