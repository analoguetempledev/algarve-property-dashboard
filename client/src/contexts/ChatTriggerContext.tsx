import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface ChatTriggerContextType {
  /** Whether the chat panel should be open */
  chatOpen: boolean;
  /** Open the chat panel */
  openChat: () => void;
  /** Close the chat panel */
  closeChat: () => void;
  /** Toggle the chat panel */
  toggleChat: () => void;
  /** A pending question to auto-send when the chat opens */
  pendingQuestion: string | null;
  /** The submitted property ID to use as context */
  pendingSubmittedPropertyId: number | null;
  /** Open the chat and trigger a question about a specific submitted property */
  askAboutProperty: (question: string, submittedPropertyId: number) => void;
  /** Clear the pending question after it has been sent */
  clearPendingQuestion: () => void;
}

const ChatTriggerContext = createContext<ChatTriggerContextType>({
  chatOpen: false,
  openChat: () => {},
  closeChat: () => {},
  toggleChat: () => {},
  pendingQuestion: null,
  pendingSubmittedPropertyId: null,
  askAboutProperty: () => {},
  clearPendingQuestion: () => {},
});

export function ChatTriggerProvider({ children }: { children: ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [pendingSubmittedPropertyId, setPendingSubmittedPropertyId] = useState<number | null>(null);

  const openChat = useCallback(() => setChatOpen(true), []);
  const closeChat = useCallback(() => setChatOpen(false), []);
  const toggleChat = useCallback(() => setChatOpen((prev) => !prev), []);

  const askAboutProperty = useCallback((question: string, submittedPropertyId: number) => {
    setPendingQuestion(question);
    setPendingSubmittedPropertyId(submittedPropertyId);
    setChatOpen(true);
  }, []);

  const clearPendingQuestion = useCallback(() => {
    setPendingQuestion(null);
    setPendingSubmittedPropertyId(null);
  }, []);

  return (
    <ChatTriggerContext.Provider
      value={{
        chatOpen,
        openChat,
        closeChat,
        toggleChat,
        pendingQuestion,
        pendingSubmittedPropertyId,
        askAboutProperty,
        clearPendingQuestion,
      }}
    >
      {children}
    </ChatTriggerContext.Provider>
  );
}

export function useChatTrigger() {
  return useContext(ChatTriggerContext);
}
