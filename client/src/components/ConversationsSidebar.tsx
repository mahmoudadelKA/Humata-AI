import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/appContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface Conversation {
  id: string;
  title: string;
  updatedAt: Date;
}

interface ConversationsSidebarProps {
  onSelectConversation: (id: string) => void;
  currentConversationId?: string;
  onNewConversation?: () => void;
}

export function ConversationsSidebar({ onSelectConversation, currentConversationId, onNewConversation }: ConversationsSidebarProps) {
  const { language, user } = useAppContext();

  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const response = await fetch("/api/conversations", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch conversations");
      return response.json();
    },
    enabled: true,
  });

  if (!user) return null;

  return (
    <div className={`w-64 border-r border-border bg-muted/20 flex flex-col ${language === "ar" ? "border-l border-r-0" : ""}`}>
      <div className="p-4 border-b border-border space-y-3">
        <Button
          onClick={onNewConversation}
          variant="default"
          className="w-full"
          data-testid="button-new-conversation"
        >
          {language === "ar" ? "محادثة جديده" : "New Conversation"}
        </Button>
        <h3 className={`text-sm font-bold text-foreground ${language === "ar" ? "text-right" : ""}`}>
          {language === "ar" ? "المحادثات المحفوظة" : "Saved Conversations"}
        </h3>
      </div>

      <div className="space-y-1 p-2 flex-1 overflow-y-auto">
        {conversations.map((conv: Conversation) => (
          <div key={conv.id} className="relative group">
            <button
              onClick={() => onSelectConversation(conv.id)}
              className={`w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm hover:bg-muted/40 transition-colors text-foreground/80 hover:text-foreground ${
                currentConversationId === conv.id ? "bg-muted text-foreground" : ""
              }`}
              data-testid={`button-conversation-${conv.id}`}
            >
              <span className="truncate text-center">{conv.title}</span>
            </button>

          </div>
        ))}
      </div>

    </div>
  );
}
