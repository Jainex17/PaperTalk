import { ChatInterface } from "@/components/ChatInterface";

interface SpacePageProps {
    spaceid: string
}

async function SpacePage({ params }: { params: Promise<SpacePageProps> }) {

    const { spaceid } = await params;
    return(
        <ChatInterface spaceid={spaceid as string} />
    )
}

export default SpacePage