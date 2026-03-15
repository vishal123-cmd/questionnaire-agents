import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Upload, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { questionnaireApi } from '@/api/client';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function QuestionnairePage() {
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<number | null>(null);

  const uploadMutation = useMutation({
    mutationFn: questionnaireApi.upload,
    onSuccess: (data) => {
      toast.success('Questionnaire uploaded! Processing...');
      setSelectedQuestionnaire(data.id);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Upload failed');
    },
  });

  const { data: results } = useQuery({
    queryKey: ['questionnaire-results', selectedQuestionnaire],
    queryFn: () => questionnaireApi.getResults(selectedQuestionnaire!),
    enabled: !!selectedQuestionnaire,
    refetchInterval: (query) => {
      return query.state.data?.status === 'completed' ? false : 3000;
    },
  });

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadMutation.mutate(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { icon: Clock, color: 'text-yellow-600 bg-yellow-100', label: 'Pending' },
      processing: { icon: Clock, color: 'text-blue-600 bg-blue-100', label: 'Processing' },
      completed: { icon: CheckCircle, color: 'text-green-600 bg-green-100', label: 'Completed' },
      error: { icon: AlertCircle, color: 'text-red-600 bg-red-100', label: 'Error' },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="h-4 w-4 mr-1" />
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Questionnaire Automation</h1>
        <p className="text-gray-600 mt-1">Upload RFPs, questionnaires, or surveys to auto-fill with AI</p>
      </div>

      {/* Upload Area */}
      {!selectedQuestionnaire && (
        <Card>
          <CardContent className="pt-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isDragActive ? 'Drop your file here' : 'Upload Questionnaire'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Drag & drop a CSV or XLSX file, or click to browse
              </p>
              <p className="text-xs text-gray-500">
                Supported formats: CSV, XLSX, XLS
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {selectedQuestionnaire && results && (
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{results.filename}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Uploaded {formatDate(new Date())}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(results.status)}
                  {results.status === 'completed' && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedQuestionnaire(null)}
                  >
                    Upload New
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Progress */}
          {results.status === 'processing' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-blue-500 animate-spin mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Processing questionnaire...
                  </h3>
                  <p className="text-gray-600">
                    AI is analyzing questions and finding answers in your knowledge base
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Table */}
          {results.status === 'completed' && results.results && (
            <Card>
              <CardHeader>
                <CardTitle>Results ({results.results.length} questions)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.results.map((item, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-5">
                          <p className="text-sm font-medium text-gray-700 mb-1">Question</p>
                          <p className="text-sm text-gray-900">{item.question}</p>
                        </div>
                        <div className="col-span-5">
                          <p className="text-sm font-medium text-gray-700 mb-1">Answer</p>
                          <p className="text-sm text-gray-900">{item.answer}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-gray-700 mb-1">Source</p>
                          <p className="text-xs text-gray-600 truncate">
                            {item.source_name || 'N/A'}
                          </p>
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  item.confidence > 0.7
                                    ? 'bg-green-500'
                                    : item.confidence > 0.4
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${item.confidence * 100}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {Math.round(item.confidence * 100)}% confidence
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {results.status === 'error' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Processing failed
                  </h3>
                  <p className="text-gray-600 mb-4">
                    There was an error processing your questionnaire
                  </p>
                  <Button onClick={() => setSelectedQuestionnaire(null)}>
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold mb-3">
                1
              </div>
              <h3 className="font-semibold mb-2">Upload File</h3>
              <p className="text-sm text-gray-600">
                Upload a CSV or XLSX file with questions in a column
              </p>
            </div>
            <div>
              <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold mb-3">
                2
              </div>
              <h3 className="font-semibold mb-2">AI Processing</h3>
              <p className="text-sm text-gray-600">
                AI analyzes each question and searches your knowledge base
              </p>
            </div>
            <div>
              <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold mb-3">
                3
              </div>
              <h3 className="font-semibold mb-2">Export Results</h3>
              <p className="text-sm text-gray-600">
                Download the completed questionnaire with answers and sources
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
