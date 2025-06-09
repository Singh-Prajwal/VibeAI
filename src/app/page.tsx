// app/page.tsx

import { ChatInterface } from "@/components/ChatInterface";

export default function Home() {
  return (
    <div className="bg-background text-foreground">
      <ChatInterface />
    </div>
  );
}
