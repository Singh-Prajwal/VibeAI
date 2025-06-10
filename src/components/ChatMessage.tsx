// components/ChatMessage.tsx

import { motion } from "framer-motion";
import { Message } from "./ChatInterface";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <motion.div
      className={cn(
        "flex items-end gap-3",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {message.role === "model" && (
        <div className="flex-shrink-0">
          <Bot className="w-6 h-6 text-primary" />
        </div>
      )}
      <div
        className={cn(
          "rounded-lg p-3 max-w-[70%]",
          message.role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        <p className="text-sm">{message.content}</p>
        {message.sentiment && message.role === "model" && (
          <p className="text-xs mt-1 opacity-75">Sentiment: {message.sentiment}</p>
        )}
      </div>
      {message.role === "user" && (
        <div className="flex-shrink-0">
          <User className="w-6 h-6 text-primary" />
        </div>
      )}
    </motion.div>
  );
};
