'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { CheckCircle2, XCircle, MessageSquare } from 'lucide-react';

interface CourseQnA {
  id: number;
  course_id: number;
  user_id: number;
  profile_id: number;
  question: string;
  answer: string | null;
  is_approved: boolean;
  answered_by: number | null;
  answered_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
  };
  profile?: {
    id: number;
    display_name: string;
  };
  answerer?: {
    id: number;
    display_name: string;
  } | null;
}

interface CourseQnAProps {
  courseId: number;
}

export default function CourseQnA({ courseId }: CourseQnAProps) {
  const [qnas, setQnas] = useState<CourseQnA[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [answeringId, setAnsweringId] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    loadQnAs();
  }, [courseId]);

  const loadQnAs = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getCourseQnAs(courseId);
      setQnas(data);
    } catch (error) {
      console.error('Failed to load Q&As:', error);
      toast.error('Failed to load questions and answers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = async (qnaId: number) => {
    const answer = answerText[qnaId]?.trim();
    if (!answer || answer.length < 10) {
      toast.error('Answer must be at least 10 characters long');
      return;
    }

    try {
      await apiClient.answerCourseQnA(courseId, qnaId, answer);
      toast.success('Answer submitted successfully');
      setAnsweringId(null);
      setAnswerText({ ...answerText, [qnaId]: '' });
      loadQnAs();
    } catch (error) {
      console.error('Failed to submit answer:', error);
      toast.error('Failed to submit answer');
    }
  };

  const handleApprove = async (qnaId: number, isApproved: boolean) => {
    try {
      await apiClient.approveCourseQnA(courseId, qnaId, isApproved);
      toast.success(
        `Q&A ${isApproved ? 'approved' : 'unapproved'} successfully`
      );
      loadQnAs();
    } catch (error) {
      console.error('Failed to update approval status:', error);
      toast.error('Failed to update approval status');
    }
  };

  const approvedQnas = qnas.filter((q) => q.is_approved);
  const pendingQnas = qnas.filter((q) => !q.is_approved);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Questions & Answers
          </CardTitle>
          <CardDescription>
            Manage questions and answers for this course
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingQnas.length > 0 && (
                <div>
                  <h3 className="mb-4 text-lg font-semibold">
                    Pending Approval ({pendingQnas.length})
                  </h3>
                  <div className="space-y-4">
                    {pendingQnas.map((qna) => (
                      <Card key={qna.id} className="border-orange-200">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                  <span className="text-sm font-semibold">
                                    {qna.profile?.display_name ||
                                      qna.user?.name ||
                                      'Anonymous'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(
                                      qna.created_at
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-gray-700">{qna.question}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApprove(qna.id, true)}
                                >
                                  <CheckCircle2 className="mr-1 h-4 w-4" />
                                  Approve
                                </Button>
                              </div>
                            </div>
                            {answeringId === qna.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={answerText[qna.id] || ''}
                                  onChange={(e) =>
                                    setAnswerText({
                                      ...answerText,
                                      [qna.id]: e.target.value
                                    })
                                  }
                                  placeholder="Type your answer here..."
                                  rows={4}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleAnswer(qna.id)}
                                  >
                                    Submit Answer
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setAnsweringId(null);
                                      setAnswerText({
                                        ...answerText,
                                        [qna.id]: ''
                                      });
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setAnsweringId(qna.id)}
                              >
                                Add Answer
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {approvedQnas.length > 0 && (
                <div>
                  <h3 className="mb-4 text-lg font-semibold">
                    Approved Q&As ({approvedQnas.length})
                  </h3>
                  <div className="space-y-4">
                    {approvedQnas.map((qna) => (
                      <Card key={qna.id}>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                  <span className="text-sm font-semibold">
                                    {qna.profile?.display_name ||
                                      qna.user?.name ||
                                      'Anonymous'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(
                                      qna.created_at
                                    ).toLocaleDateString()}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700"
                                  >
                                    Approved
                                  </Badge>
                                </div>
                                <p className="mb-3 text-gray-700">
                                  {qna.question}
                                </p>
                                {qna.answer ? (
                                  <div className="ml-4 border-l-2 border-blue-500 pl-4">
                                    <div className="mb-2 flex items-center gap-2">
                                      <span className="text-sm font-semibold text-blue-600">
                                        {qna.answerer?.display_name ||
                                          'Instructor'}
                                      </span>
                                      {qna.answered_at && (
                                        <span className="text-xs text-gray-500">
                                          {new Date(
                                            qna.answered_at
                                          ).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-gray-600">
                                      {qna.answer}
                                    </p>
                                  </div>
                                ) : (
                                  <div className="text-sm italic text-gray-500">
                                    No answer yet
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {!qna.answer && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setAnsweringId(qna.id)}
                                  >
                                    Add Answer
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApprove(qna.id, false)}
                                >
                                  <XCircle className="mr-1 h-4 w-4" />
                                  Unapprove
                                </Button>
                              </div>
                            </div>
                            {answeringId === qna.id && !qna.answer && (
                              <div className="space-y-2">
                                <Textarea
                                  value={answerText[qna.id] || ''}
                                  onChange={(e) =>
                                    setAnswerText({
                                      ...answerText,
                                      [qna.id]: e.target.value
                                    })
                                  }
                                  placeholder="Type your answer here..."
                                  rows={4}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleAnswer(qna.id)}
                                  >
                                    Submit Answer
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setAnsweringId(null);
                                      setAnswerText({
                                        ...answerText,
                                        [qna.id]: ''
                                      });
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {qnas.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  <p>No questions yet.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
