import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2, Edit2, Share2 } from "lucide-react";
import { useAppContext } from "@/lib/appContext";
import { useMutation, useQuery } from "@tanstack/react-query";

interface Conversation {
  id: string;
  title: string;
  updatedAt: Date;
}

interface ConversationsSidebarProps {
  onSelectConversation: (id: string) => void;
  currentConversationId?: string;
}

export function ConversationsSidebar({ onSelectConversation, currentConversationId }: ConversationsSidebarProps) {
  const { language, user } = useAppContext();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const response = await fetch("/api/conversations", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch conversations");
      return response.json();
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/conversations/${id}`, { 
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete");
      return response.json();
    },
    onSuccess: () => {
      setOpenMenu(null);
    },
  });

  const renameMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to rename");
      return response.json();
    },
    onSuccess: () => {
      setRenamingId(null);
      setNewTitle("");
    },
  });

  const handleRename = (id: string, currentTitle: string) => {
    setRenamingId(id);
    setNewTitle(currentTitle);
  };

  const handleShare = (id: string) => {
    const shareUrl = `${window.location.origin}?shared=${id}`;
    navigator.clipboard.writeText(shareUrl);
    alert(language === "ar" ? "تم نسخ الرابط" : "Link copied!");
    setOpenMenu(null);
  };

  if (!user) return null;

  return (
    <div className={`w-64 border-r border-border bg-muted/20 overflow-y-auto ${language === "ar" ? "border-l border-r-0" : ""}`}>
      <div className="p-4 border-b border-border">
        <h3 className={`text-sm font-bold text-foreground mb-3 ${language === "ar" ? "text-right" : ""}`}>
          {language === "ar" ? "المحادثات المحفوظة" : "Saved Conversations"}
        </h3>
      </div>

      <div className="space-y-1 p-2">
        {conversations.map((conv: Conversation) => (
          <div key={conv.id} className="relative group">
            <button
              onClick={() => onSelectConversation(conv.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-muted/40 transition-colors text-foreground/80 hover:text-foreground truncate ${
                currentConversationId === conv.id ? "bg-muted text-foreground" : ""
              }`}
              data-testid={`button-conversation-${conv.id}`}
            >
              {conv.title}
            </button>

            {renamingId === conv.id ? (
              <div className="absolute inset-0 bg-card border border-border rounded-lg flex items-center px-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="flex-1 bg-muted border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => renameMutation.mutate(conv.id)}
                  className="h-6 px-2"
                  data-testid="button-confirm-rename"
                >
                  ✓
                </Button>
              </div>
            ) : (
              <div className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setOpenMenu(openMenu === conv.id ? null : conv.id)}
                  className="p-1 hover:bg-muted/60 rounded text-muted-foreground hover:text-foreground"
                  data-testid={`button-menu-${conv.id}`}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {openMenu === conv.id && (
                  <div className="absolute top-8 left-0 bg-card border border-border rounded-lg shadow-lg z-50 w-32">
                    <button
                      onClick={() => handleRename(conv.id, conv.title)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-foreground/80 hover:text-foreground ${language === "ar" ? "flex-row-reverse" : ""}`}
                      data-testid="button-rename"
                    >
                      <Edit2 className="w-4 h-4" />
                      {language === "ar" ? "إعادة تسمية" : "Rename"}
                    </button>
                    <button
                      onClick={() => handleShare(conv.id)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-foreground/80 hover:text-foreground ${language === "ar" ? "flex-row-reverse" : ""}`}
                      data-testid="button-share"
                    >
                      <Share2 className="w-4 h-4" />
                      {language === "ar" ? "مشاركة" : "Share"}
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(conv.id)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-red-500/10 flex items-center gap-2 text-red-500 ${language === "ar" ? "flex-row-reverse" : ""}`}
                      data-testid="button-delete"
                    >
                      <Trash2 className="w-4 h-4" />
                      {language === "ar" ? "حذف" : "Delete"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
