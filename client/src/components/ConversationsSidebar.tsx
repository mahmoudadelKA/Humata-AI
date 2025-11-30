import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreVertical, Download, Trash2, Edit2 } from "lucide-react";
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
    enabled: true,
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
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  const handleDownload = (conv: Conversation) => {
    const data = JSON.stringify({ title: conv.title, timestamp: new Date() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${conv.title}-${Date.now()}.json`;
    link.click();
    setOpenMenu(null);
  };

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

      <div className="space-y-1 p-2 flex-1 overflow-y-auto overflow-x-visible">
        {conversations.map((conv: Conversation) => (
          <div key={conv.id} className="relative group">
            {renamingId === conv.id ? (
              <div className="absolute inset-0 bg-card border border-border rounded-lg flex items-center px-2 gap-2 z-20">
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
                  className="h-6 px-2 text-xs"
                  data-testid="button-confirm-rename"
                >
                  ✓
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/40 transition-colors group relative">
                  <button
                    onClick={() => onSelectConversation(conv.id)}
                    className={`flex-1 text-left text-sm truncate text-foreground/80 group-hover:text-foreground ${
                      currentConversationId === conv.id ? "text-foreground font-medium" : ""
                    }`}
                    data-testid={`button-conversation-${conv.id}`}
                  >
                    {conv.title}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenu(openMenu === conv.id ? null : conv.id);
                    }}
                    className="p-1 hover:bg-muted/60 rounded flex-shrink-0"
                    data-testid={`button-menu-${conv.id}`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {openMenu === conv.id && (
                    <div className={`absolute ${language === "ar" ? "right-full mr-1" : "left-full ml-1"} top-0 bg-card rounded-md shadow-2xl flex gap-1 p-1 animate-in fade-in-50 duration-200 z-50`}>
                      <button
                        onClick={() => {
                          setRenamingId(conv.id);
                          setNewTitle(conv.title);
                          setOpenMenu(null);
                        }}
                        className="p-1.5 hover:bg-muted/60 rounded transition-colors text-foreground/70 hover:text-foreground flex-shrink-0"
                        title={language === "ar" ? "تعديل الاسم" : "Rename"}
                        data-testid="button-rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownload(conv)}
                        className="p-1.5 hover:bg-muted/60 rounded transition-colors text-foreground/70 hover:text-foreground flex-shrink-0"
                        title={language === "ar" ? "تصدير" : "Export"}
                        data-testid="button-download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(conv.id)}
                        className="p-1.5 hover:bg-red-500/10 rounded transition-colors text-red-500 hover:text-red-600 flex-shrink-0"
                        title={language === "ar" ? "حذف" : "Delete"}
                        data-testid="button-delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
