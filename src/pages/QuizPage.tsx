import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Trophy, Star, Zap, Target, Award, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Quiz {
  id: string;
  story_id: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  questions: QuizQuestion[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface Achievement {
  id: string;
  achievement_type: string;
  achievement_data: any;
  earned_at: string;
}

export const QuizPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadQuizzes();
      loadUserStats();
      loadAchievements();
      loadDailyChallenge();
      loadLeaderboard();
    }
  }, [user]);

  const loadQuizzes = async () => {
    try {
      const { data } = await supabase
        .from('cultural_quizzes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      setQuizzes(data || []);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const { data } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.id);

      const totalQuizzes = data?.length || 0;
      const totalScore = data?.reduce((sum, result) => sum + result.score, 0) || 0;
      const totalQuestions = data?.reduce((sum, result) => sum + result.total_questions, 0) || 0;
      const totalXP = data?.reduce((sum, result) => sum + result.xp_earned, 0) || 0;

      setUserStats({
        quizzesCompleted: totalQuizzes,
        averageScore: totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0,
        totalXP,
        level: Math.floor(totalXP / 1000) + 1,
      });
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const loadAchievements = async () => {
    try {
      const { data } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      setAchievements(data || []);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    }
  };

  const loadDailyChallenge = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('daily_challenges')
        .select('*, cultural_quizzes(*)')
        .eq('challenge_date', today)
        .maybeSingle();

      setDailyChallenge(data);
    } catch (error) {
      console.error('Failed to load daily challenge:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const { data } = await supabase
        .from('quiz_results')
        .select('user_id, xp_earned')
        .order('xp_earned', { ascending: false })
        .limit(10);

      const leaderboardData = await Promise.all(
        (data || []).map(async (entry) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, username')
            .eq('id', entry.user_id)
            .maybeSingle();

          return {
            user_id: entry.user_id,
            name: profile?.full_name || profile?.username || 'Anonymous',
            xp: entry.xp_earned,
          };
        })
      );

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setStartTime(new Date());
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === selectedQuiz!.questions[currentQuestion].correct_answer;
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentQuestion < selectedQuiz!.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      finishQuiz(newAnswers, isCorrect ? score + 1 : score);
    }
  };

  const finishQuiz = async (finalAnswers: number[], finalScore: number) => {
    const timeSpent = startTime ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000) : 0;
    const totalQuestions = selectedQuiz!.questions.length;
    const percentage = Math.round((finalScore / totalQuestions) * 100);

    let xpEarned = finalScore * 10;
    if (percentage === 100) {
      xpEarned += 50;
    }

    if (dailyChallenge && selectedQuiz!.id === dailyChallenge.quiz_id) {
      xpEarned *= 2;
    }

    try {
      await supabase.from('quiz_results').insert({
        user_id: user.id,
        quiz_id: selectedQuiz!.id,
        score: finalScore,
        total_questions: totalQuestions,
        xp_earned: xpEarned,
        time_taken_seconds: timeSpent,
      });

      await checkAchievements(finalScore, totalQuestions, timeSpent);

      await loadUserStats();
      await loadAchievements();

      setShowResult(true);
    } catch (error) {
      console.error('Failed to save quiz result:', error);
    }
  };

  const checkAchievements = async (score: number, totalQuestions: number, timeSpent: number) => {
    const percentage = (score / totalQuestions) * 100;

    if (percentage === 100) {
      await supabase.from('user_achievements').upsert({
        user_id: user.id,
        achievement_type: 'perfect_score',
        achievement_data: { quiz_id: selectedQuiz!.id },
      });
    }

    if (timeSpent < 120) {
      await supabase.from('user_achievements').upsert({
        user_id: user.id,
        achievement_type: 'speed_demon',
        achievement_data: { time: timeSpent },
      });
    }

    const { count } = await supabase
      .from('quiz_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if ((count || 0) >= 50) {
      await supabase.from('user_achievements').upsert({
        user_id: user.id,
        achievement_type: 'culture_keeper',
        achievement_data: { quizzes_completed: count },
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'perfect_score': return '🎯';
      case 'speed_demon': return '⚡';
      case 'culture_keeper': return '📚';
      case 'dialect_master': return '💬';
      case 'story_sage': return '📖';
      default: return '🏆';
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (selectedQuiz && !showResult) {
    const question = selectedQuiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / selectedQuiz.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">
                  Question {currentQuestion + 1} of {selectedQuiz.questions.length}
                </span>
                <span className="text-sm font-medium text-emerald-600">
                  Score: {score}/{currentQuestion}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-heading text-gray-800 mb-6">{question.question}</h2>

              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedAnswer === index
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-6 text-lg"
            >
              {currentQuestion < selectedQuiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showResult && selectedQuiz) {
    const percentage = Math.round((score / selectedQuiz.questions.length) * 100);
    const isPerfect = percentage === 100;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 py-8"
      >
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              {isPerfect ? (
                <Trophy className="w-24 h-24 mx-auto text-yellow-500" />
              ) : percentage >= 70 ? (
                <Star className="w-24 h-24 mx-auto text-emerald-500" />
              ) : (
                <Target className="w-24 h-24 mx-auto text-gray-400" />
              )}
            </div>

            <h2 className="font-heading text-3xl text-gray-800 mb-2">
              {isPerfect ? 'Perfect Score!' : percentage >= 70 ? 'Great Job!' : 'Keep Practicing!'}
            </h2>
            <p className="text-gray-600 mb-8">
              You scored {score} out of {selectedQuiz.questions.length} ({percentage}%)
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-emerald-50 rounded-lg p-4">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                <p className="text-sm text-gray-600">Correct</p>
                <p className="text-2xl font-bold text-gray-800">{score}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <p className="text-sm text-gray-600">Incorrect</p>
                <p className="text-2xl font-bold text-gray-800">{selectedQuiz.questions.length - score}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                <p className="text-sm text-gray-600">XP Earned</p>
                <p className="text-2xl font-bold text-gray-800">{score * 10 + (isPerfect ? 50 : 0)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  setSelectedQuiz(null);
                  setShowResult(false);
                }}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                Back to Quizzes
              </Button>
              <Button
                onClick={() => startQuiz(selectedQuiz)}
                variant="outline"
                className="w-full"
              >
                Retry Quiz
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            size="sm"
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <h1 className="font-heading text-4xl text-gray-800 mb-2">Caribbean Culture Quiz</h1>
          <p className="text-gray-600">Test your knowledge and earn XP!</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {dailyChallenge && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Star className="w-8 h-8" />
                  <div>
                    <h2 className="font-heading text-2xl">Daily Challenge</h2>
                    <p className="text-sm">Complete for 2x XP!</p>
                  </div>
                </div>
                <Button
                  onClick={() => startQuiz(dailyChallenge.cultural_quizzes)}
                  className="bg-white text-purple-600 hover:bg-gray-100"
                >
                  Start Challenge
                </Button>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="font-heading text-2xl text-gray-800 mb-6">Available Quizzes</h2>
              <div className="space-y-4">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-800 mb-1">{quiz.category}</h3>
                        <p className="text-sm text-gray-600">{quiz.questions.length} questions</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full border ${getDifficultyColor(quiz.difficulty)}`}>
                        {quiz.difficulty}
                      </span>
                    </div>
                    <Button
                      onClick={() => startQuiz(quiz)}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Start Quiz
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="font-heading text-xl text-gray-800 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Your Stats
              </h2>
              {userStats && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Level</span>
                    <span className="text-lg font-bold text-emerald-600">{userStats.level}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total XP</span>
                    <span className="text-lg font-bold text-gray-800">{userStats.totalXP}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Quizzes Completed</span>
                    <span className="text-lg font-bold text-gray-800">{userStats.quizzesCompleted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Score</span>
                    <span className="text-lg font-bold text-gray-800">{userStats.averageScore}%</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="font-heading text-xl text-gray-800 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                Achievements
              </h2>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3"
                  >
                    <span className="text-2xl">{getAchievementIcon(achievement.achievement_type)}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {achievement.achievement_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(achievement.earned_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {achievements.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No achievements yet. Start quizzing!</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="font-heading text-xl text-gray-800 mb-4">Leaderboard</h2>
              <div className="space-y-2">
                {leaderboard.slice(0, 5).map((entry, index) => (
                  <div
                    key={entry.user_id}
                    className="flex items-center justify-between p-2 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-600">#{index + 1}</span>
                      <span className="text-sm text-gray-800">{entry.name}</span>
                    </div>
                    <span className="text-sm font-medium text-emerald-600">{entry.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
