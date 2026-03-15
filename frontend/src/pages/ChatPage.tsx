import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Send, ThumbsUp, ThumbsDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { chatApi } from '@/api/client';
import { ChatSource } from '@/types';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

interface DisplayMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  isStreaming?: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: chatApi.listConversations,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: DisplayMessage = {
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatApi.query({
        query: input,
        conversation_id: currentConversationId || undefined,
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage: DisplayMessage = {
        role: 'assistant',
        content: '',
        sources: [],
        isStreaming: true,
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === 'start') {
                  if (!currentConversationId) {
                    setCurrentConversationId(data.conversation_id);
                  }
                } else if (data.type === 'token') {
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === 'assistant') {
                      lastMessage.content += data.content;
                    }
                    return newMessages;
                  });
                } else if (data.type === 'sources') {
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === 'assistant') {
                      lastMessage.sources = data.sources;
                    }
                    return newMessages;
                  });
                } else if (data.type === 'end') {
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === 'assistant') {
                      lastMessage.isStreaming = false;
                    }
                    return newMessages;
                  });
                }
              } catch (e) {
                console.error('Error parsing SSE:', e);
              }
            }
          }
        }
      }
    } catch (error: any) {
      toast.error('Failed to send message');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (messageId: number | undefined, feedback: 'up' | 'down') => {
    if (!messageId) return;
    try {
      await chatApi.submitFeedback(messageId, feedback);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Conversations Sidebar */}
      <div className="w-64 flex-shrink-0 space-y-4">
        <Button
          onClick={() => {
            setMessages([]);
            setCurrentConversationId(null);
          }}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 px-2">Recent Chats</h3>
          <div className="space-y-1">
            {conversations.slice(0, 10).map(conv => (
              <button
                key={conv.id}
                onClick={() => {
                  // TODO: Load conversation messages
                  setCurrentConversationId(conv.id);
                }}
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors truncate"
              >
                {conv.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Ask anything about your knowledge base
              </h2>
              <p>Start a conversation by typing a question below</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <>
                      <ReactMarkdown className="prose prose-sm max-w-none">
                        {message.content}
                      </ReactMarkdown>

                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 mb-2">Sources:</p>
                          <div className="space-y-1">
                            {message.sources.map((source, idx) => (
                              <div
                                key={idx}
                                className="text-xs bg-white px-2 py-1 rounded border border-gray-200"
                              >
                                📄 {source.source_name}
                                {source.page && ` (Page ${source.page})`}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!message.isStreaming && message.id && (
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => handleFeedback(message.id, 'up')}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleFeedback(message.id, 'down')}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
