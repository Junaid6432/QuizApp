import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { parseFile } from '../utils/fileUtils';
import { Upload, X, CheckCircle2, AlertCircle, Save, ArrowLeft, Trash2, Database, CloudCog } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { CLASSES, getSubjectsByClass } from '../constants/collegeData';

const QuizCreator = () => {
  const { 
    addQuiz, updateQuiz, 
    quizzes, editQuizId, setEditQuizId, 
    setGameState 
  } = useQuiz();
  const [metadata, setMetadata] = useState({ 
    class: '', 
    subject: '', 
    unit: '', 
    topicName: '',
    order: '',
    questionLimit: '',
    timerEnabled: false,
    timeLimit: ''
  });
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const fileInputRef = useRef(null);

  // Load existing quiz if in edit mode
  React.useEffect(() => {
    if (editQuizId) {
      const quizToEdit = quizzes.find(q => q.id === editQuizId);
      if (quizToEdit) {
        setMetadata({
          class: quizToEdit.class,
          subject: quizToEdit.subject,
          unit: quizToEdit.unit,
          topicName: quizToEdit.topicName || '',
          order: quizToEdit.order || '',
          questionLimit: quizToEdit.questionLimit || ''
        });
        setQuestions(quizToEdit.questions);
      }
    }
  }, [editQuizId, quizzes]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      console.log('Attempting to parse file:', file.name);
      const parsedQuestions = await parseFile(file);
      console.log('Successfully parsed questions:', parsedQuestions.length);
      setQuestions(parsedQuestions);
      setError(null);
    } catch (err) {
      console.error('File parsing error:', err);
      setError(err?.toString() || 'Failed to process file');
      setQuestions([]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };


  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!metadata.class || !metadata.subject || !metadata.unit || !metadata.topicName) {
      setError('Please fill in all metadata fields (Class, Subject, Unit, Topic Name)');
      return;
    }
    if (questions.length === 0) {
      setError('Please upload at least one question');
      return;
    }

    setIsSaving(true);
    try {
      if (editQuizId) {
        await updateQuiz(editQuizId, {
          ...metadata,
          questions
        });
      } else {
        await addQuiz({
          ...metadata,
          questions,
          isActive: false
        });
      }
      
      setEditQuizId(null);
      setGameState('dashboard');
    } catch (err) {
      setError('Failed to save quiz. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  };


  const handleBack = () => {
    setEditQuizId(null);
    setGameState('dashboard');
  };

  const removeQuestion = (idx) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleClassChange = (val) => {
    setMetadata(prev => ({ ...prev, class: val }));
    const available = getSubjectsByClass(val);
    if (metadata.subject && !available.includes(metadata.subject)) {
      setMetadata(prev => ({ ...prev, class: val, subject: '' }));
    }
  };

  return (
    <div className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <button 
          onClick={handleBack}
          className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-xl"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">{editQuizId ? 'Edit Assessment' : 'Create New Topic Quiz'}</h1>
          <p className="text-slate-400">{editQuizId ? 'Update your topic details and question pool' : 'LMS Style: Create topics within units'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Metadata Form */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-6 space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Topic Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-wider">Class</label>
                  <select 
                    value={metadata.class}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 transition-colors outline-none cursor-pointer appearance-none"
                  >
                    <option value="" className="bg-slate-900">Class</option>
                    {CLASSES.map(c => (
                      <option key={c} value={c} className="bg-slate-900">Grade {c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-wider">Subject</label>
                  <select 
                    value={metadata.subject}
                    onChange={(e) => setMetadata({...metadata, subject: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 transition-colors outline-none cursor-pointer appearance-none"
                    disabled={!metadata.class}
                  >
                    <option value="" className="bg-slate-900">Subject</option>
                    {getSubjectsByClass(metadata.class).map(s => (
                      <option key={s} value={s} className="bg-slate-900">{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-wider">Unit / Chapter</label>
                <input 
                  type="text" 
                  placeholder="e.g. Unit 1"
                  value={metadata.unit}
                  onChange={(e) => setMetadata({...metadata, unit: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 transition-colors outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-wider">Topic Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Intro to Algebra"
                    value={metadata.topicName}
                    onChange={(e) => setMetadata({...metadata, topicName: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 transition-colors outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-wider">Order</label>
                  <input 
                    type="number" 
                    placeholder="1"
                    value={metadata.order}
                    onChange={(e) => setMetadata({...metadata, order: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 transition-colors outline-none"
                  />
                </div>
              </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-wider">Questions per Attempt</label>
                  <input 
                    type="number" 
                    placeholder="All questions"
                    value={metadata.questionLimit}
                    onChange={(e) => setMetadata({...metadata, questionLimit: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 transition-colors outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 italic">Randomly selects these many questions from your pool on every attempt.</p>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block tracking-wider">Enable Time Limit</label>
                      <p className="text-[10px] text-slate-500 italic">Turn on if you want a countdown timer</p>
                    </div>
                    <button 
                      onClick={() => setMetadata({...metadata, timerEnabled: !metadata.timerEnabled})}
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${metadata.timerEnabled ? 'bg-blue-600' : 'bg-slate-700'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${metadata.timerEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {metadata.timerEnabled && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-wider">Duration (Minutes)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 10"
                        value={metadata.timeLimit}
                        onChange={(e) => setMetadata({...metadata, timeLimit: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 transition-colors outline-none"
                      />
                    </motion.div>
                  )}
                </div>
              </div>

            <Button 
              onClick={handleSave} 
              className="w-full py-4 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {editQuizId ? 'Update Assessment' : 'Save Assessment'}
            </Button>
          </GlassCard>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-100 text-sm flex items-start gap-3"
            >
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <span>{error}</span>
              <button className="ml-auto" onClick={() => setError(null)}><X className="w-4 h-4" /></button>
            </motion.div>
          )}
        </div>

        {/* Right: Upload & Preview */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-0 overflow-hidden min-h-[400px] flex flex-col">
            <div className="p-6 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between bg-white/5">
              <h2 className="text-xl font-bold text-white">Questions Content</h2>
              
              <div className="flex gap-3 text-white">

                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".json,.csv"
                />
                <div className="flex flex-col items-center">
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2 px-4 text-sm flex items-center gap-2 border-white/10 hover:bg-white/5"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {isUploading ? 'Parsing...' : 'Bulk JSON/CSV'}
                  </Button>
                  <button 
                    onClick={() => setShowSample(true)}
                    className="text-[10px] text-blue-400 hover:text-blue-300 underline mt-1 font-bold transition-colors"
                  >
                    View Sample Format
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[600px]">
              {questions.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {questions.map((q, idx) => (
                    <div key={idx} className="p-6 hover:bg-white/5 transition-colors flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="text-primary-500 text-xs font-bold mb-2 uppercase">Question {idx + 1}</div>
                        <h3 className="text-white font-semibold mb-3">{q.question}</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt, i) => (
                            <div 
                              key={i} 
                              className={`text-sm px-3 py-1 rounded-lg ${
                                opt === q.answer 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                  : 'text-slate-400 bg-white/5'
                              }`}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                      <button 
                        onClick={() => removeQuestion(idx)}
                        className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-4">
                  <Upload className="w-16 h-16 opacity-10" />
                  <div>
                    <p className="text-lg">No questions loaded yet.</p>
                    <p className="text-sm">Use Bulk Upload to import questions via JSON or CSV file.</p>
                  </div>
                  <div className="text-xs text-slate-600 bg-white/5 px-4 py-2 rounded-lg max-w-lg text-left">
                    <p className="font-bold mb-1">JSON Format Example:</p>
                    <code className="block bg-black/20 p-2 rounded text-[10px] whitespace-pre-wrap">
                      {`[
  {
    "question": "Solve the matrix: $\\\\\\begin{bmatrix} a & b \\\\\\\\\\\\ c & d \\\\\\end{bmatrix}$ is?",
    "options": ["ad-bc", "ad+bc", "ab-cd", "0"],
    "answer": "ad-bc"
  }
]`}
                    </code>
                  </div>
                </div>
              )}
            </div>
            
            {questions.length > 0 && (
              <div className="p-4 bg-emerald-500/10 text-emerald-500 text-xs font-bold text-center border-t border-emerald-500/20 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {questions.length} Questions successfully validated and ready to save
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Sample Format Modal */}
      <AnimatePresence>
        {showSample && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-lg w-full relative"
            >
              <button 
                onClick={() => setShowSample(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Correct JSON Format
              </h3>
              
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5 mb-6 overflow-x-auto">
                <pre className="text-[10px] text-blue-300 font-mono leading-relaxed">
{`[
  {
    "question": "If $M = \\\\begin{bmatrix} a & b \\\\\\\\ c & d \\\\end{bmatrix}$, find $|M|$.",
    "options": ["ad-bc", "ad+bc", "ab-cd", "0"],
    "answer": "ad-bc"
  }
]`}
                </pre>
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-2 items-start text-xs text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <p>Math symbols ko hamesha <span className="text-blue-400 font-bold">$...$</span> ke andar rakhein.</p>
                </div>
                <div className="flex gap-2 items-start text-xs text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <p>JSON mein backslash ke liye <span className="text-blue-400 font-bold">\\\\\\</span> (double backslash) use karein.</p>
                </div>
              </div>

              <Button 
                onClick={() => setShowSample(false)}
                className="w-full mt-8"
              >
                I Understand
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Loading Overlay for Saving */}
      <AnimatePresence>
        {isSaving && (
          <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative mb-10"
            >
              {/* Outer Glow Circles */}
              <div className="absolute inset-0 m-auto w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="absolute inset-0 m-auto w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-75" />
              
              {/* Main Spinner */}
              <div className="w-28 h-28 border-[3px] border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
              
              <div className="absolute inset-0 m-auto w-12 h-12 flex items-center justify-center">
                <Database className="w-10 h-10 text-emerald-500 animate-bounce" />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-3"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                <CloudCog className="w-3.6 h-3.6 animate-spin" style={{ animationDuration: '3s' }} />
                Secure Cloud Sync
              </div>
              <h4 className="text-4xl font-black text-white tracking-tighter">Saving Assessment</h4>
              <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm leading-relaxed">
                Finalizing quiz structure and syncing metadata with the secure portal cloud...
              </p>
            </motion.div>
            
            {/* Minimal Progress Indicator */}
            <div className="absolute bottom-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-full h-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
                />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
);
};

export default QuizCreator;
