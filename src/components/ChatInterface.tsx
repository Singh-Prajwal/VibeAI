"use client";

import { useState, useRef, useEffect, useCallback, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizonal, PlusCircle, Menu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { ChatMessage } from "./ChatMessage";
import Image from "next/image";

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

export interface Message {
  role: "user" | "model" | "loading";
  content: string;
  sentiment?: string;
}

const TypingAnimation = () => (
  <span className="inline-block">
    <motion.span
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1, repeat: Infinity }}
      className="mx-0.5"
    >
      .
    </motion.span>
    <motion.span
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
      className="mx-0.5"
    >
      .
    </motion.span>
    <motion.span
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
      className="mx-0.5"
    >
      .
    </motion.span>
  </span>
);

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const startNewChat = useCallback(() => {
    const newChatId = `chat-${Date.now()}`;
    const newChat: ChatSession = {
      id: newChatId,
      title: `New Chat ${chatSessions.length + 1}`,
      messages: [],
    };
    setChatSessions((prev) => [...prev, newChat]);
    setActiveChatId(newChatId);
    setMessages([]);
  }, [chatSessions.length]);

  useEffect(() => {
    const storedSessions = localStorage.getItem("chatSessions");
    if (storedSessions) {
      const parsedSessions: ChatSession[] = JSON.parse(storedSessions);
      setChatSessions(parsedSessions);
      if (parsedSessions.length > 0) {
        const lastChat = parsedSessions[parsedSessions.length - 1];
        setActiveChatId(lastChat.id);
        setMessages(lastChat.messages);
      } else {
        startNewChat();
      }
    } else {
      startNewChat();
    }
  }, [startNewChat]);

  useEffect(() => {
    localStorage.setItem("chatSessions", JSON.stringify(chatSessions));
  }, [chatSessions]);

  useEffect(() => {
    if (activeChatId) {
      const currentSession = chatSessions.find(
        (session) => session.id === activeChatId
      );
      if (
        currentSession &&
        currentSession.messages.length !== messages.length
      ) {
        setMessages(currentSession.messages);
      }
    }
  }, [activeChatId, chatSessions, messages.length]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector("div");
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const loadChat = (chatId: string) => {
    setActiveChatId(chatId);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const loadingMessage: Message = { role: "loading", content: "Thinking..." };

    const newMessages = [...messages, userMessage, loadingMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    setChatSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === activeChatId
          ? { ...session, messages: newMessages }
          : session
      )
    );

    try {
      const history = newMessages
        .filter((msg) => msg.role !== "loading")
        .map((msg) => ({
          role: msg.role === "model" ? "model" : "user",
          parts: [{ text: msg.content }],
        }));
      history.pop();

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, history }),
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);

      const data = await response.json();
      const modelMessage: Message = {
        role: "model",
        content: data.reply,
        sentiment: data.sentiment,
      };

      const updatedMessages = [...messages, userMessage, modelMessage];
      setMessages(updatedMessages);

      setChatSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === activeChatId
            ? { ...session, messages: updatedMessages }
            : session
        )
      );
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        role: "model",
        content: "Sorry, I ran into a problem. Please try again.",
      };
      const updatedMessages = [...messages, userMessage, errorMessage];
      setMessages(updatedMessages);

      setChatSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === activeChatId
            ? { ...session, messages: updatedMessages }
            : session
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex h-full">
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              key="sidebar"
              initial={{ x: -250, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -250, opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="flex-col w-[240px] border-r border-border bg-secondary p-4 md:flex"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-secondary-foreground">
                  Previous Chats
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={startNewChat}
                  className="text-secondary-foreground hover:bg-primary/10"
                >
                  <PlusCircle className="w-5 h-5" />
                </Button>
              </div>
              <ScrollArea className="flex-1 pr-2">
                <motion.div
                  layout
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {chatSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        variant={
                          activeChatId === session.id ? "secondary" : "ghost"
                        }
                        className="w-full justify-start text-left"
                        onClick={() => loadChat(session.id)}
                      >
                        {session.title}
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col">
          <header className="flex items-center justify-between p-4 border-b border-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-foreground"
            >
              <Menu className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-2">
              <Image
                src="/VibeAI_logo.png"
                alt="VibeAI Logo"
                width={50}
                height={50}
              />
              <h1 className="text-lg font-semibold text-foreground">VibeAI</h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-hidden">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="flex flex-col gap-6 p-4 md:p-6">
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center space-y-2"
                  >
                    <h2 className="text-xl font-medium text-foreground">
                      Welcome to VibeAI
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      VibeAI is designed to provide you with instant support and
                      information.
                    </p>
                  </motion.div>
                )}
                <AnimatePresence initial={false}>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {message.role === "loading" ? (
                        <div className="text-foreground">
                          Thinking
                          <TypingAnimation />
                        </div>
                      ) : (
                        <ChatMessage message={message} />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </main>

          <form onSubmit={handleSubmit} className="border-t border-border p-4">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-secondary border-primary text-foreground placeholder:text-muted-foreground"
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <SendHorizonal className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
