import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { Upload, Plus, Trash2, Link as LinkIcon, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { sourcesApi } from '@/api/client';
import { Source } from '@/types';
import { formatDate, formatFileSize, getFileIcon } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function KnowledgePage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<'file' | 'url'>('file');
  const [urlName, setUrlName] = useState('');
  const [urlValue, setUrlValue] = useState('');
  const queryClient = useQueryClient();

  const { data: sources = [], isLoading } = useQuery({
    queryKey: ['sources'],
    queryFn: sourcesApi.list,
  });

  const uploadMutation = useMutation({
    mutationFn: sourcesApi.uploadFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      toast.success('File uploaded successfully!');
      setShowAddModal(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Upload failed');
    },
  });

  const addUrlMutation = useMutation({
    mutationFn: ({ name, url }: { name: string; url: string }) => 
      sourcesApi.addUrl(name, url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      toast.success('URL added successfully!');
      setShowAddModal(false);
      setUrlName('');
      setUrlValue('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to add URL');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: sourcesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      toast.success('Source deleted');
    },
    onError: () => {
      toast.error('Failed to delete source');
    },
  });

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      uploadMutation.mutate(file);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  });

  const getStatusBadge = (status: Source['status']) => {
    const badges = {
      pending: { icon: Clock, color: 'text-yellow-600 bg-yellow-100', label: 'Pending' },
      indexing: { icon: Clock, color: 'text-blue-600 bg-blue-100', label: 'Indexing' },
      indexed: { icon: CheckCircle, color: 'text-green-600 bg-green-100', label: 'Indexed' },
      error: { icon: AlertCircle, color: 'text-red-600 bg-red-100', label: 'Error' },
    };
    const badge = badges[status];
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-600 mt-1">Manage your documents and data sources</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </Button>
      </div>

      {/* Sources Grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading sources...</div>
      ) : sources.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No sources yet</h3>
            <p className="text-gray-600 mb-6">
              Upload documents or connect data sources to get started
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Source
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sources.map((source) => (
            <Card key={source.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getFileIcon(source.file_type || source.type)}</span>
                    <CardTitle className="text-base truncate">{source.name}</CardTitle>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Delete this source?')) {
                        deleteMutation.mutate(source.id);
                      }
                    }}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  {getStatusBadge(source.status)}
                  <span className="text-xs text-gray-500">
                    {source.chunk_count} chunks
                  </span>
                </div>
                
                {source.file_size && (
                  <p className="text-sm text-gray-600">
                    {formatFileSize(source.file_size)}
                  </p>
                )}
                
                <p className="text-xs text-gray-500">
                  Added {formatDate(source.created_at)}
                </p>
                
                {source.last_synced_at && (
                  <p className="text-xs text-gray-500">
                    Last synced {formatDate(source.last_synced_at)}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Add Knowledge Source</CardTitle>
              <div className="flex space-x-2 mt-4">
                <Button
                  variant={addMode === 'file' ? 'default' : 'outline'}
                  onClick={() => setAddMode('file')}
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
                <Button
                  variant={addMode === 'url' ? 'default' : 'outline'}
                  onClick={() => setAddMode('url')}
                  size="sm"
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Add URL
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {addMode === 'file' ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600">
                    {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Supports: PDF, DOCX, TXT, MD, CSV, XLSX
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <Input
                      placeholder="My Website"
                      value={urlName}
                      onChange={(e) => setUrlName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL
                    </label>
                    <Input
                      placeholder="https://example.com"
                      value={urlValue}
                      onChange={(e) => setUrlValue(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={() => {
                      if (urlName && urlValue) {
                        addUrlMutation.mutate({ name: urlName, url: urlValue });
                      }
                    }}
                    disabled={!urlName || !urlValue || addUrlMutation.isPending}
                    className="w-full"
                  >
                    Add URL
                  </Button>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
