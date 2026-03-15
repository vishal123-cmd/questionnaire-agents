import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Database, MessageSquare, FileText, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { sourcesApi, chatApi } from '@/api/client';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { data: sources = [] } = useQuery({
    queryKey: ['sources'],
    queryFn: sourcesApi.list,
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: chatApi.listConversations,
  });

  const indexedSources = sources.filter(s => s.status === 'indexed').length;
  const totalChunks = sources.reduce((sum, s) => sum + s.chunk_count, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your knowledge base and activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Sources</CardTitle>
            <Database className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sources.length}</div>
            <p className="text-xs text-gray-500 mt-1">{indexedSources} indexed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Conversations</CardTitle>
            <MessageSquare className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversations.length}</div>
            <p className="text-xs text-gray-500 mt-1">Total chats</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Docs Indexed</CardTitle>
            <FileText className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalChunks}</div>
            <p className="text-xs text-gray-500 mt-1">Text chunks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Response</CardTitle>
            <TrendingUp className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2s</div>
            <p className="text-xs text-gray-500 mt-1">Query time</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/knowledge">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <Database className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Add Sources</div>
                  <div className="text-xs text-gray-500">Upload docs or connect integrations</div>
                </div>
              </Button>
            </Link>

            <Link to="/chat">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <MessageSquare className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Start Chat</div>
                  <div className="text-xs text-gray-500">Ask questions about your docs</div>
                </div>
              </Button>
            </Link>

            <Link to="/questionnaire">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <FileText className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Auto-fill RFP</div>
                  <div className="text-xs text-gray-500">Upload questionnaire</div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Conversations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No conversations yet</p>
              <Link to="/chat">
                <Button className="mt-4">Start your first chat</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.slice(0, 5).map((conv) => (
                <Link
                  key={conv.id}
                  to={`/chat?conversation=${conv.id}`}
                  className="block p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{conv.title}</p>
                      <p className="text-sm text-gray-500">{conv.message_count} messages</p>
                    </div>
                    <p className="text-sm text-gray-400">{formatDate(conv.created_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
