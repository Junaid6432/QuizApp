import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { 
  User, 
  School, 
  Award, 
  Hash, 
  Mail, 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert,
  Camera
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';

const TeacherProfile = () => {
  const { teacherProfile, updateProfile, setGameState, user } = useQuiz();
  const [formData, setFormData] = useState({
    displayName: '',
    designation: 'PST',
    schoolName: '',
    emisCode: '',
    email: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Sync with current profile
  useEffect(() => {
    if (teacherProfile) {
      setFormData({
        displayName: teacherProfile.displayName || '',
        designation: teacherProfile.designation || 'PST',
        schoolName: teacherProfile.schoolName || '',
        emisCode: teacherProfile.emisCode || '',
        email: teacherProfile.email || user?.email || ''
      });
    }
  }, [teacherProfile, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatus({ type: '', message: '' });

    try {
      await updateProfile({
        displayName: formData.displayName,
        designation: formData.designation,
        schoolName: formData.schoolName,
        emisCode: formData.emisCode
      });
      setStatus({ type: 'success', message: 'Profile updated successfully!' });
      // Clear status after 3 seconds
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex items-center gap-6">
        <button 
          onClick={() => setGameState('dashboard')}
          className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-xl"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Teacher Profile</h1>
          <p className="text-slate-500 font-medium">Manage your professional identity and school details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary Card */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-8 text-center flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl bg-accent-gradient flex items-center justify-center text-white text-4xl font-black shadow-2xl relative z-10">
                {formData.displayName ? formData.displayName[0].toUpperCase() : 'T'}
              </div>
              <div className="absolute -inset-2 bg-blue-500/20 rounded-[2.5rem] blur-xl group-hover:bg-blue-500/30 transition-all" />
              <button className="absolute bottom-[-8px] right-[-8px] z-20 p-2.5 bg-slate-900 border border-white/10 rounded-xl text-blue-400 hover:text-white transition-all shadow-xl">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-8 space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">{formData.displayName || 'Teacher Name'}</h2>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider">
                <Award className="w-3 h-3" />
                {formData.designation}
              </div>
            </div>

            <div className="mt-8 w-full border-t border-white/5 pt-6 space-y-4">
               <div className="flex items-center gap-3 text-left">
                  <div className="p-2 bg-white/5 rounded-lg text-slate-500">
                    <School className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">School</p>
                    <p className="text-sm text-slate-300 font-bold truncate">{formData.schoolName || 'Not Set'}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3 text-left">
                  <div className="p-2 bg-white/5 rounded-lg text-slate-500">
                    <Hash className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">EMIS Code</p>
                    <p className="text-sm text-slate-300 font-bold">{formData.emisCode || '000000'}</p>
                  </div>
               </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 bg-amber-500/5 border-amber-500/20">
             <div className="flex items-start gap-4">
                <ShieldAlert className="w-6 h-6 text-amber-500 flex-shrink-0" />
                <div>
                   <h3 className="text-sm font-black text-amber-500 uppercase tracking-wider mb-1">Important Info</h3>
                   <p className="text-xs text-amber-200/60 leading-relaxed">
                     Changing your **EMIS Code** will switch your school context. You will only see quizzes and student data associated with the new code.
                   </p>
                </div>
             </div>
          </GlassCard>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2">
          <GlassCard className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {status.message && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border ${
                    status.type === 'success' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                      : 'bg-red-500/10 border-red-500/20 text-red-500'
                  }`}
                >
                  {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  {status.message}
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-400/80 uppercase tracking-[0.2em] ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      placeholder="e.g. Junaid Ur Rehman"
                      required
                      className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-400/80 uppercase tracking-[0.2em] ml-1">Designation</label>
                  <div className="relative">
                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <select 
                      value={formData.designation}
                      onChange={(e) => setFormData({...formData, designation: e.target.value})}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium appearance-none cursor-pointer"
                    >
                      <option value="PST">PST</option>
                      <option value="EST">EST</option>
                      <option value="SST">SST</option>
                      <option value="Head Teacher">Head Teacher</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-400/80 uppercase tracking-[0.2em] ml-1">School Name</label>
                  <div className="relative">
                    <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      value={formData.schoolName}
                      onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
                      placeholder="e.g. GPS No 4 Kunda"
                      required
                      className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-400/80 uppercase tracking-[0.2em] ml-1">EMIS Code</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      value={formData.emisCode}
                      onChange={(e) => setFormData({...formData, emisCode: e.target.value})}
                      placeholder="6-digit code"
                      required
                      className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-400/80 uppercase tracking-[0.2em] ml-1">Email Address (Read Only)</label>
                <div className="relative opacity-60">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="email" 
                    value={formData.email}
                    disabled
                    className="w-full bg-slate-900/20 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-slate-400 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div className="pt-6 flex flex-col md:flex-row gap-4">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 py-4 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Profile Changes
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setGameState('dashboard')}
                  className="flex-1 py-4 border-white/10 hover:border-white/20"
                >
                  Return to Dashboard
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
