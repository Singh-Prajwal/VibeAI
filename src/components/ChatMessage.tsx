import { Bot, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LoadingDots } from "./LoadingDots";

export interface Message {
  role: "user" | "model" | "loading";
  content: string;
}

export const ChatMessage = ({ role, content }: Message) => {
  const isUserModel = role === "model";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex items-start gap-4 max-w-[85%]",
        role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
        {isUserModel ? (
          <Bot className="w-5 h-5 text-primary" />
        ) : (
          <User className="w-5 h-5 text-secondary-foreground" />
        )}
      </div>
      <div
        className={cn(
          "p-3 rounded-lg",
          isUserModel
            ? "bg-secondary text-secondary-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        {role === "loading" ? (
          <LoadingDots />
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        )}
      </div>
    </motion.div>
  );
};
