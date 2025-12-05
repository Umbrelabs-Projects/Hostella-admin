// src/app/dashboard/broadcast/_components/BroadcastHeader.tsx

import { Button } from "@/components/ui/button";
import { MessageCircleMoreIcon } from "lucide-react";

interface BroadcastHeaderProps {
  onComposeClick: () => void;
}

export default function BroadcastHeader({ onComposeClick }: BroadcastHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <MessageCircleMoreIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Broadcast Messages</h1>
            <p className="mt-1 text-sm text-gray-600">Send messages to residents and members</p>
          </div>
        </div>
      </div>
      <Button
        onClick={onComposeClick}
        className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
      >
        <MessageCircleMoreIcon className="mr-2 h-4 w-4" />
        Compose Message
      </Button>
    </div>
  );
}
