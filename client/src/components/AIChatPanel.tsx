// ============================================================
// DESIGN: AI Chat Panel (SSE + Chat History)
// Warm light theme, gold accents, thread sidebar, persistent conversations
// Now integrates with ChatTriggerContext for property-contextual questions
// ============================================================

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Bot,
  Sparkles,
  User,
  AlertCircle,
  Plus,
  MessageSquare,
  Trash2,
  ChevronLeft,
  History,
  Loader2,
} from "lucide-react";
import { Streamdown } from "streamdown";
import { useActiveProperty } from "@/contexts/PropertyContext";
import { useChatTrigger } from "@/contexts/ChatTriggerContext";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  error?: boolean;
  streaming?: boolean;
}

interface AIChatPanelProps {
  open: boolean;
  onClose: () => void;
  propertyId?: number;
}

const GENERAL_WELCOME =
  "Welcome. I have access to all property listings, market data, and AI insights from the Algarve region. Ask me anything — property valuations, market trends, risk analysis, or offer strategies.";

const GENERAL_PROMPTS = [
  "What are the best value properties?",
  "Algarve market trends",
  "Compare properties by AI score",
  "Which areas are appreciating fastest?",
];

const PROPERTY_PROMPTS = [
  "Is this a good deal?",
  "What are the risks?",
  "Compare with similar properties",
  "What should I offer?",
];

export default function AIChatPanel({
  open,
  onClose,
  propertyId,
}: AIChatPanelProps) {
  const { activePropertyAddress } = useActiveProperty();
  const { isAuthenticated } = useAuth();
  const {
    pendingQuestion,
    pendingSubmittedPropertyId,
    clearPendingQuestion,
  } = useChatTrigger();

  // Thread state
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [showThreadList, setShowThreadList] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(true);

  // Track the current submitted property context for the SSE stream
  const [currentSubmittedPropertyId, setCurrentSubmittedPropertyId] = useState<number | null>(null);

  // Messages state
  const [messages, setMessages] = useState<LocalMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: GENERAL_WELCOME,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastPropertyId, setLastPropertyId] = useState<number | undefined>(
    undefined
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // tRPC hooks
  const utils = trpc.useUtils();
  const threadsQuery = trpc.chatHistory.listThreads.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const threadDetailQuery = trpc.chatHistory.getThread.useQuery(
    { threadId: activeThreadId! },
    { enabled: !!activeThreadId && isAuthenticated }
  );
  const createThreadMutation = trpc.chatHistory.createThread.useMutation({
    onSuccess: () => utils.chatHistory.listThreads.invalidate(),
  });
  const deleteThreadMutation = trpc.chatHistory.deleteThread.useMutation({
    onSuccess: () => utils.chatHistory.listThreads.invalidate(),
  });
  const addMessageMutation = trpc.chatHistory.addMessage.useMutation();
  const autoTitleMutation = trpc.chatHistory.autoTitle.useMutation({
    onSuccess: () => utils.chatHistory.listThreads.invalidate(),
  });

  // Load thread messages when activeThreadId changes
  useEffect(() => {
    if (threadDetailQuery.data && activeThreadId) {
      const loadedMessages: LocalMessage[] = threadDetailQuery.data.messages.map(
        (m) => ({
          id: m.id.toString(),
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: new Date(m.createdAt),
        })
      );
      if (loadedMessages.length > 0) {
        setMessages(loadedMessages);
        setIsFirstMessage(false);
      } else {
        resetToWelcome();
        setIsFirstMessage(true);
      }
    }
  }, [threadDetailQuery.data, activeThreadId]);

  // Update welcome message when property context changes
  useEffect(() => {
    if (propertyId !== lastPropertyId) {
      setLastPropertyId(propertyId);
      if (!activeThreadId) {
        resetToWelcome();
      }
    }
  }, [propertyId, activePropertyAddress, lastPropertyId, activeThreadId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  function resetToWelcome() {
    const welcomeContent =
      propertyId && activePropertyAddress
        ? `I'm now focused on **${activePropertyAddress}**. I have detailed data about this property including its AI score, pricing analysis, comparable sales, and disclosure risks. Ask me anything about this listing!`
        : GENERAL_WELCOME;
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: welcomeContent,
        timestamp: new Date(),
      },
    ]);
    setIsFirstMessage(true);
  }

  const quickPrompts = propertyId ? PROPERTY_PROMPTS : GENERAL_PROMPTS;

  const handleNewThread = () => {
    setActiveThreadId(null);
    setCurrentSubmittedPropertyId(null);
    resetToWelcome();
    setShowThreadList(false);
  };

  const handleSelectThread = (threadId: number) => {
    setActiveThreadId(threadId);
    setShowThreadList(false);
  };

  const handleDeleteThread = async (threadId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteThreadMutation.mutateAsync({ threadId });
    if (activeThreadId === threadId) {
      handleNewThread();
    }
  };

  // Core send function that accepts a message string directly
  const sendMessage = useCallback(async (messageText: string, submittedPropId?: number | null) => {
    const trimmed = messageText.trim();
    if (!trimmed || isStreaming) return;

    // Update the submitted property context if provided
    if (submittedPropId) {
      setCurrentSubmittedPropertyId(submittedPropId);
    }

    const effectiveSubmittedPropertyId = submittedPropId || currentSubmittedPropertyId;

    const userMsg: LocalMessage = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    const assistantMsgId = (Date.now() + 1).toString();

    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        streaming: true,
      },
    ]);
    setInput("");
    setIsStreaming(true);

    // Create a thread if this is the first message and user is authenticated
    let threadId = activeThreadId;
    if (!threadId && isAuthenticated) {
      try {
        const newThread = await createThreadMutation.mutateAsync({
          title: "New Conversation",
          propertyId: propertyId,
        });
        if (newThread) {
          threadId = newThread.id;
          setActiveThreadId(newThread.id);
        }
      } catch (err) {
        console.error("[Chat] Failed to create thread:", err);
      }
    }

    // Persist user message
    if (threadId && isAuthenticated) {
      try {
        await addMessageMutation.mutateAsync({
          threadId,
          role: "user",
          content: trimmed,
        });
      } catch (err) {
        console.error("[Chat] Failed to persist user message:", err);
      }
    }

    // Build conversation history (exclude welcome, limit to last 10)
    const allMessages = [
      ...messages.filter((m) => m.id !== "welcome"),
      userMsg,
    ];
    const conversationHistory = allMessages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Abort any previous stream
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const abortController = new AbortController();
    abortRef.current = abortController;

    let fullContent = "";

    try {
      const response = await fetch("/api/ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationHistory,
          propertyId: propertyId,
          submittedPropertyId: effectiveSubmittedPropertyId || undefined,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Stream request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body reader");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith("data: ")) continue;

          const data = trimmedLine.slice(6);
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.content) {
              fullContent += parsed.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: fullContent }
                    : m
                )
              );
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }

      // Mark streaming as complete
      const finalContent =
        fullContent ||
        "I apologize, but I was unable to generate a response. Please try again.";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, streaming: false, content: finalContent }
            : m
        )
      );

      // Persist assistant message
      if (threadId && isAuthenticated) {
        try {
          await addMessageMutation.mutateAsync({
            threadId,
            role: "assistant",
            content: finalContent,
          });
        } catch (err) {
          console.error("[Chat] Failed to persist assistant message:", err);
        }
      }

      // Auto-title on first message
      if (isFirstMessage && threadId) {
        setIsFirstMessage(false);
        autoTitleMutation.mutate({
          threadId,
          firstMessage: trimmed,
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") return;
      console.error("[AI Chat] Stream error:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                streaming: false,
                error: true,
                content:
                  "I apologize, but I encountered an issue processing your request. Please try again.",
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [
    isStreaming,
    messages,
    propertyId,
    activeThreadId,
    isAuthenticated,
    isFirstMessage,
    currentSubmittedPropertyId,
  ]);

  // Handle input send (from text field)
  const handleSend = useCallback(() => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
  }, [input, isStreaming, sendMessage]);

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  // Handle pending question from ChatTriggerContext (triggered by suggested questions on analysis page)
  useEffect(() => {
    if (open && pendingQuestion && !isStreaming) {
      // Small delay to ensure the panel is fully rendered
      const timer = setTimeout(() => {
        sendMessage(pendingQuestion, pendingSubmittedPropertyId);
        clearPendingQuestion();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, pendingQuestion, pendingSubmittedPropertyId, isStreaming]);

  // Cancel stream on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  const threads = threadsQuery.data || [];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: -40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-20 bottom-20 z-50 w-[480px] h-[640px] rounded-2xl overflow-hidden flex flex-col bg-card border border-border"
            style={{
              boxShadow:
                "0 24px 64px rgba(0,0,0,0.4), 0 0 24px rgba(223,176,58,0.08)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold-dim flex items-center justify-center relative">
                  <Sparkles className="w-4 h-4 text-gold" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-terra-green border-2 border-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground font-heading">
                    Property Assistant
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    {isStreaming
                      ? "Analyzing property data..."
                      : currentSubmittedPropertyId
                        ? "Property context active"
                        : activeThreadId
                          ? "Conversation saved"
                          : "Powered by GPT-4o"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Thread history toggle */}
                {isAuthenticated && (
                  <button
                    onClick={() => setShowThreadList(!showThreadList)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      showThreadList
                        ? "bg-gold-dim text-gold"
                        : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-gold-dim"
                    }`}
                    title="Chat history"
                  >
                    <History className="w-3.5 h-3.5" />
                  </button>
                )}
                {/* New chat */}
                <button
                  onClick={handleNewThread}
                  className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-gold-dim transition-all"
                  title="New conversation"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                {/* Close */}
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-gold-dim transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Thread List Overlay */}
            <AnimatePresence>
              {showThreadList && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-[57px] left-0 right-0 bottom-0 z-10 bg-card flex flex-col"
                >
                  <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowThreadList(false)}
                        className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <h4 className="text-sm font-semibold text-foreground font-heading">
                        Conversations
                      </h4>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {threads.length} thread{threads.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {threadsQuery.isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-5 h-5 text-gold animate-spin" />
                      </div>
                    ) : threads.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                        <MessageSquare className="w-8 h-8 text-muted-foreground/40 mb-3" />
                        <p className="text-sm text-muted-foreground">
                          No conversations yet
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          Start chatting and your conversations will be saved
                          here
                        </p>
                      </div>
                    ) : (
                      <div className="py-2">
                        {threads.map((thread) => (
                          <button
                            key={thread.id}
                            onClick={() => handleSelectThread(thread.id)}
                            className={`w-full px-5 py-3 flex items-center gap-3 hover:bg-secondary/60 transition-all group text-left ${
                              activeThreadId === thread.id
                                ? "bg-gold-dim/50 border-l-2 border-gold"
                                : ""
                            }`}
                          >
                            <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground truncate">
                                {thread.title}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {new Date(thread.updatedAt).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>
                            <button
                              onClick={(e) => handleDeleteThread(thread.id, e)}
                              className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-red-500 hover:!bg-red-50 transition-all"
                              title="Delete conversation"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* New conversation button at bottom */}
                  <div className="px-5 py-3 border-t border-border">
                    <button
                      onClick={handleNewThread}
                      className="w-full py-2.5 rounded-xl text-sm font-medium bg-gold/10 text-gold hover:bg-gold/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      New Conversation
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-warm-bg"
            >
              {/* Thread loaded indicator */}
              {activeThreadId && threadDetailQuery.isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 text-gold animate-spin" />
                  <span className="text-xs text-muted-foreground ml-2">
                    Loading conversation...
                  </span>
                </div>
              )}

              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                      msg.role === "assistant"
                        ? msg.error
                          ? "bg-red-100 text-red-500"
                          : "bg-gold-dim text-gold"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      msg.error ? (
                        <AlertCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Bot className="w-3.5 h-3.5" />
                      )
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div
                    className={`max-w-[82%] px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
                      msg.role === "assistant"
                        ? msg.error
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-card text-foreground border border-border shadow-sm"
                        : "bg-gold-dim text-foreground border border-gold/20"
                    }`}
                  >
                    {msg.role === "assistant" && !msg.error ? (
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-headings:my-1.5 prose-strong:text-foreground">
                        {msg.content ? (
                          <Streamdown>{msg.content}</Streamdown>
                        ) : msg.streaming ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="text-muted-foreground text-xs">
                              Thinking
                            </span>
                            <span className="flex gap-1">
                              <span
                                className="w-1 h-1 rounded-full bg-gold/60 animate-bounce"
                                style={{ animationDelay: "0ms" }}
                              />
                              <span
                                className="w-1 h-1 rounded-full bg-gold/60 animate-bounce"
                                style={{ animationDelay: "150ms" }}
                              />
                              <span
                                className="w-1 h-1 rounded-full bg-gold/60 animate-bounce"
                                style={{ animationDelay: "300ms" }}
                              />
                            </span>
                          </span>
                        ) : null}
                        {msg.streaming && msg.content && (
                          <span className="inline-block w-0.5 h-4 bg-gold/70 animate-pulse ml-0.5 align-text-bottom" />
                        )}
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Prompts */}
            {messages.length <= 2 && !isStreaming && !showThreadList && (
              <div className="px-5 pb-2 bg-card">
                <p className="text-[10px] text-muted-foreground mb-1.5 font-medium">
                  Try asking:
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {quickPrompts.map((prompt: string) => (
                    <button
                      key={prompt}
                      onClick={() => handleQuickPrompt(prompt)}
                      className="px-3 py-1.5 rounded-full text-[10px] font-medium bg-secondary border border-border text-muted-foreground hover:text-foreground hover:bg-gold-dim hover:border-gold/20 transition-all whitespace-nowrap"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-5 pb-4 pt-2 bg-card border-t border-border">
              {!isAuthenticated && (
                <p className="text-[10px] text-muted-foreground mb-1.5 text-center">
                  Sign in to save your conversations
                </p>
              )}
              <div className="flex items-center gap-2 bg-secondary border border-border rounded-xl px-4 py-2.5 focus-within:border-gold/40 focus-within:ring-1 focus-within:ring-gold/20 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={
                    isStreaming
                      ? "Waiting for response..."
                      : currentSubmittedPropertyId
                        ? "Ask about this property..."
                        : "Ask about properties, market data..."
                  }
                  disabled={isStreaming}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming}
                  className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center text-gold hover:bg-gold/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
