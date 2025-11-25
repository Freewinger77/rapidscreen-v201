import { useState, useRef, useEffect } from "react";
import { useZoomDialog } from "@/polymet/components/animated-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendIcon, CheckCheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppAgentTesterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  whatsappMessage: string;
  agentPrompt?: string;
}

type Message = {
  id: string;
  text: string;
  sender: "agent" | "user";
  time: string;
  status: "sent" | "delivered" | "read";
};

export function WhatsAppAgentTester({
  open,
  onOpenChange,
  whatsappMessage,
  agentPrompt,
}: WhatsAppAgentTesterProps) {
  useZoomDialog();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with agent's first message when dialog opens
  useEffect(() => {
    if (open && messages.length === 0) {
      setTimeout(() => {
        addAgentMessage(
          whatsappMessage || "Hi! We have an exciting opportunity for you."
        );
      }, 500);
    }
  }, [open]);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const addAgentMessage = (text: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      text,
      sender: "agent",
      time: getCurrentTime(),
      status: "read",
    };
    setMessages((prev) => [...prev, newMessage]);
    setIsTyping(false);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      text: inputValue,
      sender: "user",
      time: getCurrentTime(),
      status: "sent",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate agent typing
    setIsTyping(true);

    // Simulate agent response after a delay
    setTimeout(
      () => {
        const responses = [
          "Great! Can you tell me more about your experience?",
          "That's perfect! Do you have any relevant certifications?",
          "Excellent! When would you be available to start?",
          "Thank you for that information. Are you interested in this opportunity?",
          "I understand. Let me check the details for you.",
        ];

        const randomResponse =
          responses[Math.floor(Math.random() * responses.length)];
        addAgentMessage(randomResponse);
      },
      1500 + Math.random() * 1000
    );

    // Update message status to delivered then read
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: "delivered" } : msg
        )
      );
    }, 500);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: "read" } : msg
        )
      );
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setMessages([]);
    setInputValue("");
    setIsTyping(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 gap-0" data-zoom="true">
        {/* WhatsApp Header */}
        <DialogHeader className="bg-[#008069] dark:bg-[#1f2c33] p-4 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
              AI
            </div>
            <div className="flex-1">
              <DialogTitle className="text-white text-base">
                Recruitment Agent
              </DialogTitle>
              {agentPrompt && (
                <p className="text-xs text-white/70 mt-1">Using live AI prompt</p>
              )}
              <p className="text-xs text-white/80">
                {isTyping ? "typing..." : "Online"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Chat Messages */}
        <div className="bg-[#efeae2] dark:bg-[#0b141a] p-4 h-[400px] overflow-y-auto">
          <div className="space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-lg p-2 shadow-sm",
                    message.sender === "user"
                      ? "bg-[#d9fdd3] dark:bg-[#005c4b]"
                      : "bg-white dark:bg-[#1f2c33]"
                  )}
                >
                  <p
                    className={cn(
                      "text-sm",
                      message.sender === "user"
                        ? "text-black dark:text-white"
                        : "text-black dark:text-white"
                    )}
                  >
                    {message.text}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {message.time}
                    </span>
                    {message.sender === "user" && (
                      <CheckCheckIcon
                        className={cn(
                          "w-4 h-4",
                          message.status === "read"
                            ? "text-[#53bdeb]"
                            : "text-gray-400"
                        )}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-[#1f2c33] rounded-lg p-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />

                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />

                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-[#f0f2f5] dark:bg-[#1f2c33] p-3 rounded-b-lg">
          <div className="flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message"
              className="flex-1 bg-white dark:bg-[#2a3942] border-none"
            />

            <Button
              onClick={handleSendMessage}
              size="icon"
              className="bg-[#008069] hover:bg-[#017561] dark:bg-[#00a884] dark:hover:bg-[#008f6d]"
              disabled={!inputValue.trim()}
            >
              <SendIcon className="w-4 h-4 text-white" />
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">
            This is a simulated chat to test the WhatsApp agent
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
