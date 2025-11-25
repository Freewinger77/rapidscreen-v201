/**
 * WhatsApp Chat View Component
 * 
 * Displays chat history from backend database
 */

import { useEffect, useState } from 'react';
import { getChatHistoryByPhone } from '@/lib/backend-api';
import type { ChatMessage } from '@/lib/backend-types';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquareIcon } from 'lucide-react';

interface WhatsAppChatViewProps {
  phoneNumber: string;
}

export function WhatsAppChatView({ phoneNumber }: WhatsAppChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMessages() {
      setLoading(true);
      setError(null);
      
      try {
        const chatHistory = await getChatHistoryByPhone(phoneNumber);
        setMessages(chatHistory);
      } catch (err) {
        console.error('Failed to load chat:', err);
        setError('Failed to load chat history');
      } finally {
        setLoading(false);
      }
    }

    loadMessages();
  }, [phoneNumber]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading chat history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquareIcon className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">No messages found for {phoneNumber}</p>
        <p className="text-xs text-muted-foreground mt-2">
          Messages will appear here once a campaign is launched
        </p>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <MessageSquareIcon className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold">WhatsApp Chat</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{phoneNumber}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {messages.length} messages
        </p>
      </div>
      
      <ScrollArea className="h-[500px]">
        <div className="p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-lg p-3 ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <div className="flex items-center justify-between gap-2 mt-2">
                  <span className="text-xs opacity-70">
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ''}
                  </span>
                  {msg.status && (
                    <span className="text-xs opacity-70 capitalize">{msg.status}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}

