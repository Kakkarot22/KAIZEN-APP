import React, { useState, useEffect, useMemo } from 'react';
import { 
  Volume2, 
  ChevronRight, 
  ArrowRight,
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  BookOpen, 
  Layers, 
  ShieldAlert, 
  Settings, 
  X,
  Compass,
  ArrowLeft,
  Flame,
  Search,
  Check
} from 'lucide-react';

// Datasets
import examQuestions from './data/questions_exam_enhanced.json';
import grammarData from './data/grammar_all.json';
import vocabCurriculum from './data/vocab_curriculum.json';
import kanjiLookalikes from './data/kanji_lookalikes.json';
import kanjiN5 from './data/kanji_n5.json';
import kanjiN4 from './data/kanji_n4.json';
import kanjiN3 from './data/kanji_n3.json';

const KANJI_MAP = {
  5: kanjiN5,
  4: kanjiN4,
  3: kanjiN3
};


const EXAM_DATES = {
  'July 2027': new Date('2027-07-04T09:00:00'),
  'Dec 2027': new Date('2027-12-05T09:00:00'),
  'July 2028': new Date('2028-07-02T09:00:00'),
  'Dec 2028': new Date('2028-12-03T09:00:00')
};

const TOTAL_CURRICULUM = {
  5: { vocab: 708, kanji: 66, cumVocab: 708, cumKanji: 66 },
  4: { vocab: 796, kanji: 142, cumVocab: 1504, cumKanji: 208 },
  3: { vocab: 2350, kanji: 320, cumVocab: 3854, cumKanji: 528 }
};

function App() {
  const [level, setLevel] = useState(() => parseInt(localStorage.getItem('kz_level') || '5', 10));
  const [activeNav, setActiveNav] = useState('vocab'); // 'vocab' | 'grammar' | 'kanji' | 'exam' | 'vault'
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem('kz_streak') || '1', 10));
  const [mistakes, setMistakes] = useState(() => {
    const s = localStorage.getItem('kz_mistakes');
    return s ? JSON.parse(s) : [];
  });
  const [masteredVocab, setMasteredVocab] = useState(() => {
    try {
      const s = localStorage.getItem('kz_mastered_vocab');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [masteredKanji, setMasteredKanji] = useState(() => {
    try {
      const s = localStorage.getItem('kz_mastered_kanji');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  const toggleMasteredVocab = (word) => {
    setMasteredVocab(prev => {
      const next = prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word];
      try { localStorage.setItem('kz_mastered_vocab', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const toggleMasteredKanji = (kanji) => {
    setMasteredKanji(prev => {
      const next = prev.includes(kanji) ? prev.filter(k => k !== kanji) : [...prev, kanji];
      try { localStorage.setItem('kz_mastered_kanji', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };
  const [showSettings, setShowSettings] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [targetExam, setTargetExam] = useState(() => localStorage.getItem('kz_target_exam') || 'July 2027');
  const [voiceGender, setVoiceGender] = useState(() => localStorage.getItem('kz_voice_gender') || 'female'); // 'female' | 'male'
  const [voiceRate, setVoiceRate] = useState(() => parseFloat(localStorage.getItem('kz_voice_rate') || '0.9'));
  const [voicePitch, setVoicePitch] = useState(() => parseFloat(localStorage.getItem('kz_voice_pitch') || '1.0'));
  const [showFurigana, setShowFurigana] = useState(() => localStorage.getItem('kz_furigana') !== 'false');
  const [isHudExpanded, setIsHudExpanded] = useState(false);

  // Cumulative Scope State
  const [isCumulative, setIsCumulative] = useState(() => localStorage.getItem('kz_cumulative') === 'true');
  useEffect(() => {
    localStorage.setItem('kz_cumulative', isCumulative.toString());
  }, [isCumulative]);

  // Pacing Engine Calculations
  const todayDateStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [dailyProgress, setDailyProgress] = useState(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const saved = localStorage.getItem(`kz_daily_${today}`);
      return saved ? JSON.parse(saved) : { vocab: 0, kanji: 0, drills: 0 };
    } catch {
      return { vocab: 0, kanji: 0, drills: 0 };
    }
  });

  const handleActivity = (type) => {
    setDailyProgress(prev => {
      const next = { ...prev, [type]: (prev[type] || 0) + 1 };
      try {
        localStorage.setItem(`kz_daily_${todayDateStr}`, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const targetDate = EXAM_DATES[targetExam] || new Date('2027-07-04T09:00:00');
  const msRemaining = targetDate.getTime() - new Date().getTime();
  const daysRemaining = Math.max(1, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
  const studyDays = Math.max(14, daysRemaining - 30); // 30 days buffer for mock exams
  const curr = TOTAL_CURRICULUM[level] || TOTAL_CURRICULUM[5];
  const totalVocab = (isCumulative && level < 5) ? curr.cumVocab : curr.vocab;
  const totalKanji = (isCumulative && level < 5) ? curr.cumKanji : curr.kanji;
  const dailyVocabTarget = Math.max(5, Math.ceil(totalVocab / studyDays));
  const dailyKanjiTarget = Math.max(1, Math.ceil(totalKanji / studyDays));
  const dailyDrillTarget = 2;

  const isQuotaComplete = dailyProgress.vocab >= dailyVocabTarget && 
                          dailyProgress.kanji >= dailyKanjiTarget && 
                          dailyProgress.drills >= dailyDrillTarget;
  
  const [aiModal, setAiModal] = useState(null);

  // Sync storage
  useEffect(() => {
    localStorage.setItem('kz_level', level.toString());
  }, [level]);
  useEffect(() => {
    localStorage.setItem('kz_mistakes', JSON.stringify(mistakes));
  }, [mistakes]);
  useEffect(() => {
    localStorage.setItem('kz_target_exam', targetExam);
  }, [targetExam]);
  useEffect(() => {
    localStorage.setItem('kz_voice_gender', voiceGender);
  }, [voiceGender]);
  useEffect(() => {
    localStorage.setItem('kz_voice_rate', voiceRate.toString());
  }, [voiceRate]);
  useEffect(() => {
    localStorage.setItem('kz_voice_pitch', voicePitch.toString());
  }, [voicePitch]);
  useEffect(() => {
    localStorage.setItem('kz_furigana', showFurigana.toString());
  }, [showFurigana]);
  

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const clean = text.replace(/<[^>]*>/g, '').replace(/\{([^|]+)\|[^}]+\}/g, '$1');
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = 'ja-JP';
      u.rate = voiceRate;
      u.pitch = voiceGender === 'female' ? Math.max(voicePitch, 1.1) : Math.min(voicePitch, 0.85);

      // Select female or male Japanese voice if available in browser
      const voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('ja'));
      if (voices.length > 0) {
        if (voiceGender === 'female') {
          const fVoice = voices.find(v => v.name.toLowerCase().includes('female') || v.name.includes('Nanami') || v.name.includes('Kyoko') || v.name.includes('Ayumi'));
          if (fVoice) u.voice = fVoice;
        } else {
          const mVoice = voices.find(v => v.name.toLowerCase().includes('male') || v.name.includes('Keita') || v.name.includes('Otoya') || v.name.includes('Ichiro'));
          if (mVoice) u.voice = mVoice;
        }
      }

      window.speechSynthesis.speak(u);
    }
  };

  const addMistake = (q, picked) => {
    if (!mistakes.some(m => m.id === q.id)) {
      setMistakes(prev => [{ ...q, picked, timestamp: Date.now() }, ...prev]);
    }
  };

  const removeMistake = (id) => {
    setMistakes(prev => prev.filter(m => m.id !== id));
  };

  const askAi = (q, picked) => {
    setAiModal({ q, picked, loading: true, res: null });
    setTimeout(() => {
      const found = q.options_analysis?.find(o => o.option === picked);
      setAiModal({
        q,
        picked,
        loading: false,
        res: `1. THE TRAP ANALYSIS\nYou selected "${picked}". ${found?.why || q.e}\n\n2. THE DECISIVE RULE\nCorrect Answer: "${q.correct_answer}".\n${q.key_takeaway || q.e}\n\n3. EXAM RECALL SHORTCUT\nWhen you see this sentence structure on the JLPT, check the particle/stem immediately before the blank to eliminate this distractor in 3 seconds.`
      });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5E5E7] font-sans antialiased selection:bg-white/20 selection:text-white flex flex-col">
      {/* Precision Apple / Tesla Inspired Header */}
      <nav className="sticky top-0 z-50 bg-[#000000]/85 backdrop-blur-xl border-b border-[#222224] transition-all">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-6">
            <span className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
              KAIZEN
            </span>

            {/* Level Selector & Cumulative Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#161618] rounded-full p-0.5 border border-[#27272A]">
                {[5, 4, 3].map(lv => (
                  <button
                    key={lv}
                    onClick={() => setLevel(lv)}
                    className={`px-3 py-0.5 text-xs font-medium rounded-full transition-all duration-200 ${
                      level === lv
                        ? 'bg-white text-black shadow-sm font-semibold'
                        : 'text-[#86868B] hover:text-white'
                    }`}
                  >
                    N{lv}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Segments */}
          <div className="hidden md:flex items-center space-x-1 bg-[#161618] p-1 rounded-full border border-[#27272A] text-xs">
            {[
              { id: 'vocab', label: 'Vocabulary' },
              { id: 'grammar', label: 'Grammar' },
              { id: 'kanji', label: 'Kanji' },
              { id: 'exam', label: 'JLPT Mock Exams' },
              { id: 'vault', label: `Mistakes (${mistakes.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveNav(tab.id)}
                className={`px-4 py-1.5 rounded-full transition-all duration-200 font-medium ${
                  activeNav === tab.id
                    ? 'bg-[#27272A] text-white'
                    : 'text-[#86868B] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Action */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-1.5 text-xs text-[#86868B] font-mono">
              <Flame className="w-3.5 h-3.5 text-white" />
              <span>{streak}d</span>
            </div>
            <button
              onClick={() => setShowRoadmap(true)}
              className="px-2.5 py-1 bg-violet-950/40 border border-violet-500/40 text-violet-300 hover:text-white rounded-full text-xs font-mono font-semibold transition-all flex items-center gap-1.5"
              title="Next in KAIZEN: AI Sensei & Voice Listening"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span className="hidden sm:inline">v2.0 Roadmap</span>
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="text-[#86868B] hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-[#1C1C1E] bg-[#000000] text-xs text-[#86868B]">
          {['vocab', 'grammar', 'kanji', 'exam', 'vault'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveNav(tab)}
              className={`capitalize py-1 px-2.5 rounded-full ${
                activeNav === tab ? 'bg-[#27272A] text-white font-medium' : ''
              }`}
            >
              {tab === 'vault' ? `Mistakes (${mistakes.length})` : tab === 'exam' ? 'Mock Exams' : tab}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Experience */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        {/* JLPT Exam Readiness & Daily Pacing HUD (Collapsible - zero layout clutter) */}
        {!isHudExpanded ? (
          <div className="mb-6 px-4 py-3 bg-[#121214] border border-[#222224] rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5 text-xs font-mono">
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white font-semibold">
                N{level} • {targetExam}
              </span>
              <span className="text-white font-bold">{daysRemaining}d to exam</span>
              <span className="text-[#86868B] hidden sm:inline">•</span>
              <span className="hidden sm:flex items-center gap-2.5 text-[#86868B]">
                <span>Vocab: <strong className={dailyProgress.vocab >= dailyVocabTarget ? 'text-emerald-400' : 'text-white'}>{dailyProgress.vocab}/{dailyVocabTarget}</strong></span>
                <span>•</span>
                <span>Kanji: <strong className={dailyProgress.kanji >= dailyKanjiTarget ? 'text-emerald-400' : 'text-white'}>{dailyProgress.kanji}/{dailyKanjiTarget}</strong></span>
                <span>•</span>
                <span>Drills: <strong className={dailyProgress.drills >= dailyDrillTarget ? 'text-emerald-400' : 'text-white'}>{dailyProgress.drills}/{dailyDrillTarget}</strong></span>
              </span>
            </div>
            <button
              onClick={() => setIsHudExpanded(true)}
              className="text-[11px] font-mono text-[#86868B] hover:text-white flex items-center gap-1 transition-colors ml-auto"
            >
              Pacing HUD Details ▼
            </button>
          </div>
        ) : (
          <div className="mb-6 p-5 sm:p-6 bg-[#121214] border border-[#222224] rounded-3xl relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-96 h-36 bg-gradient-to-bl from-white/[0.04] to-transparent pointer-events-none rounded-tr-3xl" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              {/* Left: Exam Countdown & Status */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-white/10 text-white">
                    JLPT N{level} • {targetExam} {isCumulative && level < 5 ? '• Cumulative' : ''}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Pacing Active
                  </span>
                  <button
                    onClick={() => setIsHudExpanded(false)}
                    className="ml-auto text-[11px] font-mono text-[#86868B] hover:text-white transition-colors"
                  >
                    Collapse ▲
                  </button>
                </div>
                <div className="flex items-baseline gap-2.5 pt-0.5">
                  <h2 className="text-3xl font-extrabold text-white tracking-tight font-mono">
                    {daysRemaining}
                  </h2>
                  <span className="text-xs uppercase font-mono text-[#86868B] tracking-wider">
                    Days Remaining to Exam
                  </span>
                </div>
                <p className="text-xs text-[#86868B]">
                  Daily prescription calibrated to finish with 30 days of mock exams buffer.
                </p>
              </div>

              {/* Right: 3 Daily Activity Progress Rings / Bars */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-md w-full">
                {/* Vocab Target */}
                <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-2xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[11px] text-[#86868B] font-mono">
                    <span>VOCAB</span>
                    <span className={dailyProgress.vocab >= dailyVocabTarget ? 'text-emerald-400 font-bold' : 'text-white'}>
                      {dailyProgress.vocab}/{dailyVocabTarget}
                    </span>
                  </div>
                  <div className="w-full bg-[#27272A] h-1.5 rounded-full overflow-hidden mt-2.5">
                    <div 
                      className="h-full bg-white transition-all duration-500 rounded-full" 
                      style={{ width: `${Math.min(100, (dailyProgress.vocab / dailyVocabTarget) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Kanji Target */}
                <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-2xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[11px] text-[#86868B] font-mono">
                    <span>KANJI</span>
                    <span className={dailyProgress.kanji >= dailyKanjiTarget ? 'text-emerald-400 font-bold' : 'text-white'}>
                      {dailyProgress.kanji}/{dailyKanjiTarget}
                    </span>
                  </div>
                  <div className="w-full bg-[#27272A] h-1.5 rounded-full overflow-hidden mt-2.5">
                    <div 
                      className="h-full bg-white transition-all duration-500 rounded-full" 
                      style={{ width: `${Math.min(100, (dailyProgress.kanji / dailyKanjiTarget) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Exam Drills Target */}
                <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-2xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[11px] text-[#86868B] font-mono">
                    <span>DRILLS</span>
                    <span className={dailyProgress.drills >= dailyDrillTarget ? 'text-emerald-400 font-bold' : 'text-white'}>
                      {dailyProgress.drills}/{dailyDrillTarget}
                    </span>
                  </div>
                  <div className="w-full bg-[#27272A] h-1.5 rounded-full overflow-hidden mt-2.5">
                    <div 
                      className="h-full bg-white transition-all duration-500 rounded-full" 
                      style={{ width: `${Math.min(100, (dailyProgress.drills / dailyDrillTarget) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Completion Banner */}
            {isQuotaComplete && (
              <div className="mt-4 pt-3 border-t border-[#222224] flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <Check className="w-4 h-4" /> Today's JLPT Readiness Quota Complete!
                </span>
                <span className="text-[#86868B] font-mono">Streak Maintained</span>
              </div>
            )}
          </div>
        )}
        {activeNav === 'vocab' && (
          <VocabExperience 
            key={`vocab-${level}-${isCumulative}`} 
            level={level} 
            speak={speak} 
            onMistake={addMistake} 
            onActivity={handleActivity} 
            isCumulative={isCumulative} 
            masteredVocab={masteredVocab}
            onToggleMastered={toggleMasteredVocab}
            mistakes={mistakes}
          />
        )}
        {activeNav === 'grammar' && (
          <GrammarExperience 
            key={`grammar-${level}`} 
            level={level} 
            speak={speak} 
            onMistake={addMistake} 
          />
        )}
        {activeNav === 'kanji' && (
          <KanjiExperience 
            key={`kanji-${level}-${isCumulative}`} 
            level={level} 
            speak={speak} 
            onActivity={handleActivity} 
            isCumulative={isCumulative} 
            masteredKanji={masteredKanji}
            onToggleMastered={toggleMasteredKanji}
            mistakes={mistakes}
          />
        )}
        {activeNav === 'exam' && (
          <ExamExperience 
            key={`exam-${level}`} 
            level={level} 
            speak={speak} 
            onMistake={addMistake} 
            askAi={askAi} 
            onActivity={handleActivity} 
          />
        )}
        {activeNav === 'vault' && (
          <VaultExperience 
            mistakes={mistakes} 
            level={level} 
            speak={speak} 
            onResolve={removeMistake} 
            askAi={askAi} 
          />
        )}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-[#27272A] rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#222224]">
              <h3 className="font-semibold text-white text-sm">Study Preferences</h3>
              <button onClick={() => setShowSettings(false)} className="text-[#86868B] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Target JLPT Exam Selection */}
              <div>
                <label className="text-[#86868B] block mb-1.5 font-mono uppercase text-[11px]">TARGET JLPT EXAM</label>
                <div className="grid grid-cols-3 gap-2">
                  {['July 2027', 'Dec 2027', 'July 2028'].map(date => (
                    <button
                      key={date}
                      onClick={() => setTargetExam(date)}
                      className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                        targetExam === date
                          ? 'bg-white text-black border-white font-semibold'
                          : 'bg-[#161618] border-[#27272A] text-[#86868B] hover:text-white'
                      }`}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>

              {/* Study Scope (Single Level vs Cumulative) */}
              <div>
                <label className="text-[#86868B] block mb-1.5 font-mono uppercase text-[11px]">JLPT CURRICULUM SCOPE</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIsCumulative(false)}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                      !isCumulative
                        ? 'bg-white text-black border-white font-semibold'
                        : 'bg-[#161618] border-[#27272A] text-[#86868B] hover:text-white'
                    }`}
                  >
                    N{level} Only
                  </button>
                  <button
                    onClick={() => { if (level < 5) setIsCumulative(true); }}
                    disabled={level === 5}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                      isCumulative && level < 5
                        ? 'bg-emerald-500 text-black border-emerald-400 font-semibold'
                        : 'bg-[#161618] border-[#27272A] text-[#86868B] hover:text-white disabled:opacity-40'
                    }`}
                  >
                    Cumulative (N5–N{level})
                  </button>
                </div>
                <p className="text-[11px] text-[#86868B] mt-1.5 leading-relaxed">
                  {level === 5 ? 'N5 is the baseline level.' : isCumulative ? `Includes all prerequisite N5–N${level - 1} + N${level} vocabulary & kanji.` : `Focuses strictly on N${level} material.`}
                </p>
              </div>

              {/* Voice Gender Selection */}
              <div>
                <label className="text-[#86868B] block mb-1.5 font-mono uppercase text-[11px]">NATIVE VOICE GENDER</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setVoiceGender('female')}
                    className={`py-2 px-4 rounded-xl border text-center font-medium transition-all ${
                      voiceGender === 'female'
                        ? 'bg-white text-black border-white font-semibold'
                        : 'bg-[#161618] border-[#27272A] text-[#86868B] hover:text-white'
                    }`}
                  >
                    Female (女声)
                  </button>
                  <button
                    onClick={() => setVoiceGender('male')}
                    className={`py-2 px-4 rounded-xl border text-center font-medium transition-all ${
                      voiceGender === 'male'
                        ? 'bg-white text-black border-white font-semibold'
                        : 'bg-[#161618] border-[#27272A] text-[#86868B] hover:text-white'
                    }`}
                  >
                    Male (男声)
                  </button>
                </div>
              </div>

              {/* Voice Speed & Pitch Sliders */}
              <div className="p-4 bg-[#161618] border border-[#27272A] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Voice Speed: {voiceRate}x</span>
                  <span className="text-[#86868B] font-mono">{voiceRate <= 0.8 ? 'Slow' : voiceRate >= 1.1 ? 'Fast' : 'Normal'}</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.3"
                  step="0.05"
                  value={voiceRate}
                  onChange={e => setVoiceRate(parseFloat(e.target.value))}
                  className="w-full accent-white"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-white font-medium">Voice Pitch: {voicePitch}x</span>
                  <button 
                    onClick={() => speak('こんにちは。日本語を勉強しましょう。')}
                    className="text-xs text-white hover:underline flex items-center gap-1 font-mono"
                  >
                    <Volume2 className="w-3 h-3" /> Test Voice
                  </button>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.4"
                  step="0.05"
                  value={voicePitch}
                  onChange={e => setVoicePitch(parseFloat(e.target.value))}
                  className="w-full accent-white"
                />
              </div>

              {/* Furigana Display Toggle */}
              <div className="p-4 bg-[#161618] border border-[#27272A] rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-white font-medium block">Furigana Reading Aids</span>
                  <span className="text-[#86868B] text-[11px]">Display hiragana readings above kanji</span>
                </div>
                <button
                  onClick={() => setShowFurigana(f => !f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    showFurigana ? 'bg-white text-black' : 'bg-[#27272A] text-[#86868B]'
                  }`}
                >
                  {showFurigana ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Reset Data */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (confirm('Reset your study streak and mistake vault?')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="w-full py-2.5 bg-rose-950/20 border border-rose-500/30 text-rose-300 font-medium rounded-xl hover:bg-rose-950/40 transition-colors text-xs"
                >
                  Reset Progress & Clear Mistakes
                </button>
              </div>
            </div>

                          {/* Roadmap Preview inside Settings */}
              <div 
                onClick={() => { setShowSettings(false); setShowRoadmap(true); }}
                className="p-4 bg-gradient-to-r from-violet-950/40 via-[#161618] to-cyan-950/30 border border-violet-500/30 hover:border-violet-400/60 rounded-2xl cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Next: AI Sensei & Audio Choukai
                  </span>
                  <span className="text-[10px] text-white font-semibold font-mono underline">View Roadmap →</span>
                </div>
                <p className="text-[11px] text-[#A1A1A6] leading-relaxed">
                  Preview upcoming AI voice conversation, official audio listening comprehension, and sentence composition.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-5 py-2 bg-white text-black font-semibold text-xs rounded-full hover:bg-neutral-200 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

            {/* KAIZEN v2.0 ROADMAP MODAL */}
      {showRoadmap && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-[#27272A] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#222224]">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <span className="p-1.5 bg-violet-950/60 border border-violet-500/40 rounded-xl text-violet-400">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-white">KAIZEN v2.0 Roadmap</h3>
                  <p className="text-[11px] text-[#86868B] font-mono">NEXT-GEN CAPABILITIES IN DEVELOPMENT</p>
                </div>
              </div>
              <button onClick={() => setShowRoadmap(false)} className="text-[#86868B] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Feature 1: AI Sensei */}
              <div className="p-4 bg-[#161618] border border-[#27272A] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold font-mono uppercase text-[11px] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    1. AI Sensei (Conversational Tutor)
                  </span>
                  <span className="text-[10px] font-mono text-[#86868B] bg-[#1C1C1E] px-2 py-0.5 rounded-full">v2.0 Core</span>
                </div>
                <p className="text-[#A1A1A6] leading-relaxed">
                  Interactive Japanese conversation practice. Speak with an AI native sensei that dynamically adapts vocabulary to your exact JLPT level (N5–N3), points out speech unnaturalness, and teaches nuanced polite vs casual registers.
                </p>
              </div>

              {/* Feature 2: Choukai Voice Listening */}
              <div className="p-4 bg-[#161618] border border-[#27272A] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 font-bold font-mono uppercase text-[11px] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    2. Official Choukai (Listening Practice)
                  </span>
                  <span className="text-[10px] font-mono text-[#86868B] bg-[#1C1C1E] px-2 py-0.5 rounded-full">v2.1 Audio</span>
                </div>
                <p className="text-[#A1A1A6] leading-relaxed">
                  Full JLPT Listening Comprehension simulator. Authentic dialogues (train stations, stores, office chatter) with speed control, synchronized furigana transcripts, and forensic breakdown of distractor audio traps.
                </p>
              </div>

              {/* Feature 3: AI Sentence Autopsy */}
              <div className="p-4 bg-[#161618] border border-[#27272A] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold font-mono uppercase text-[11px] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    3. AI Grammar Composition & Autopsy
                  </span>
                  <span className="text-[10px] font-mono text-[#86868B] bg-[#1C1C1E] px-2 py-0.5 rounded-full">v2.2 Writing</span>
                </div>
                <p className="text-[#A1A1A6] leading-relaxed">
                  Compose sentences using newly learned grammar structures and receive instant line-by-line autopsy on particle misuse, collocations, and false friends.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-[#222224] text-xs">
              <span className="text-[#86868B] font-mono text-[11px]">Free client-side upgrade</span>
              <button
                onClick={() => setShowRoadmap(false)}
                className="px-5 py-2 bg-white text-black font-semibold rounded-full hover:bg-neutral-200"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Drawer */}
      {aiModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-[#27272A] rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-[#222224]">
              <div className="flex items-center gap-2 text-white text-sm font-semibold">
                <Sparkles className="w-4 h-4 text-white" />
                <span>Forensic Error Breakdown</span>
              </div>
              <button onClick={() => setAiModal(null)} className="text-[#86868B] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 overflow-y-auto space-y-4 text-xs leading-relaxed text-[#D1D1D6]">
              {aiModal.loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-mono text-[#86868B]">Analyzing mistake...</span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap font-sans bg-[#161618] p-4 rounded-2xl border border-[#27272A]">
                  {aiModal.res}
                </div>
              )}
            </div>
            <div className="pt-3 border-t border-[#222224] flex justify-end">
              <button
                onClick={() => setAiModal(null)}
                className="px-4 py-2 bg-[#27272A] text-white text-xs font-semibold rounded-full hover:bg-[#323236] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 1. VOCABULARY: LEARN PHASE + QUIZ PHASE
// ============================================================================
function VocabExperience({ level, speak, onMistake, onActivity, isCumulative, masteredVocab = [], onToggleMastered, mistakes = [] }) {
  // If in cumulative mode, allow switching between current level and prerequisite levels
  const [activeCurriculumLevel, setActiveCurriculumLevel] = useState(level);
  useEffect(() => {
    setActiveCurriculumLevel(level);
  }, [level]);

  const sets = useMemo(() => {
    return vocabCurriculum[`n${activeCurriculumLevel}`] || [];
  }, [activeCurriculumLevel]);

  const [selectedSet, setSelectedSet] = useState(0);
  useEffect(() => {
    setSelectedSet(0);
    setCardIdx(0);
    setQuizIdx(0);
  }, [activeCurriculumLevel]);
  const [mode, setMode] = useState('study'); // 'study' | 'flashcards' | 'quiz'
  const [cardIdx, setCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const currentWords = sets[selectedSet]?.words || [];
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const activeQ = useMemo(() => {
    if (!currentWords.length || mode !== 'quiz') return null;
    const w = currentWords[quizIdx] || currentWords[0];
    const drills = w.drills || [];
    const d = drills[0];
    const drillType = d?.type || 'vm';

    let questionBadge = 'SELECT ENGLISH MEANING';
    let promptWord = w.w;
    let promptReading = w.rd;
    let correct = w.mean;
    let rawOptions = [];
    let explanation = '';

    if (drillType === 'kr') {
      // Kanji Reading Question: Test reading (DO NOT leak reading above kanji!)
      questionBadge = 'SELECT CORRECT READING';
      promptWord = w.w;
      promptReading = null;
      correct = d.reading || d.right_option || w.rd;
      rawOptions = [correct, d.wrong1, d.wrong2, d.wrong3].filter(Boolean);
      explanation = `${w.w} is pronounced 「${w.rd}」 (${w.mean}).`;
    } else if (drillType === 'ko') {
      // Kanji Orthography Question: Test kanji spelling from hiragana
      questionBadge = 'SELECT CORRECT KANJI';
      promptWord = w.rd;
      promptReading = null;
      correct = d.expression || d.right_option || w.w;
      rawOptions = [correct, d.wrong1, d.wrong2, d.wrong3].filter(Boolean);
      explanation = `「${w.rd}」 is written in kanji as ${w.w} (${w.mean}).`;
    } else {
      // Meaning Question: Test English meaning
      questionBadge = 'SELECT ENGLISH MEANING';
      promptWord = w.w;
      promptReading = (w.w !== w.rd) ? w.rd : null;
      correct = d?.right_option || d?.meaning || w.mean;
      if (d?.wrong1 && d?.wrong2 && d?.wrong3) {
        rawOptions = [correct, d.wrong1, d.wrong2, d.wrong3];
      } else {
        const otherMeans = currentWords
          .filter(other => other.mean !== w.mean)
          .map(other => other.mean)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        rawOptions = [correct, ...otherMeans];
      }
      explanation = `${w.w} (${w.rd}) means "${w.mean}".`;
    }

    const uniqueOptions = Array.from(new Set(rawOptions)).sort(() => 0.5 - Math.random());

    return {
      word: w.w,
      reading: w.rd,
      meaning: w.mean,
      drillType,
      questionBadge,
      promptWord,
      promptReading,
      correct,
      options: uniqueOptions,
      explanation
    };
  }, [currentWords, quizIdx, mode]);

  const handlePickAnswer = (opt) => {
    if (hasAnswered) return;
    onActivity && onActivity('vocab');
    setSelectedAnswer(opt);
    setHasAnswered(true);
    if (opt === activeQ.correct) {
      setScore(s => s + 1);
      if (!masteredVocab.includes(activeQ.word)) {
        onToggleMastered && onToggleMastered(activeQ.word);
      }
    } else {
      onMistake({
        id: `vocab-${activeQ.word}-${Date.now()}`,
        lv: level,
        s: 'vocab',
        t: activeQ.drillType,
        q: `${activeQ.promptWord}${activeQ.promptReading ? ` (${activeQ.promptReading})` : ''}`,
        correct_answer: activeQ.correct,
        e: activeQ.explanation
      }, opt);
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setHasAnswered(false);
    if (quizIdx + 1 < currentWords.length) {
      setQuizIdx(i => i + 1);
    } else {
      alert(`Set Complete! Your score: ${score + (selectedAnswer === activeQ.correct ? 0 : 0)} / ${currentWords.length}`);
      setMode('study');
      setQuizIdx(0);
      setScore(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Set Navigation & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222224]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#86868B]">
            N{activeCurriculumLevel} Core Lexicon • {sets.length} Curated Modules
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5">
            Vocabulary Mastery
          </h1>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center bg-[#161618] p-1 rounded-full border border-[#27272A] text-xs">
          <button
            onClick={() => { setMode('study'); setQuizIdx(0); }}
            className={`px-3 sm:px-4 py-1.5 rounded-full transition-all duration-200 font-medium ${
              mode === 'study' ? 'bg-white text-black font-semibold' : 'text-[#86868B] hover:text-white'
            }`}
          >
            List
          </button>
          <button
            onClick={() => { setMode('flashcards'); setCardIdx(0); setIsFlipped(false); }}
            className={`px-3 sm:px-4 py-1.5 rounded-full transition-all duration-200 font-medium ${
              mode === 'flashcards' ? 'bg-white text-black font-semibold' : 'text-[#86868B] hover:text-white'
            }`}
          >
            Flashcards
          </button>
          <button
            onClick={() => { setMode('quiz'); setQuizIdx(0); setSelectedAnswer(null); setHasAnswered(false); setScore(0); }}
            className={`px-3 sm:px-4 py-1.5 rounded-full transition-all duration-200 font-medium ${
              mode === 'quiz' ? 'bg-white text-black font-semibold' : 'text-[#86868B] hover:text-white'
            }`}
          >
            Quiz
          </button>
        </div>
      </div>

      {/* Cumulative Prerequisite Level Selector Tabs (if cumulative is active) */}
      {isCumulative && level < 5 && (
        <div className="flex items-center gap-2 p-1 bg-[#161618] border border-[#27272A] rounded-2xl text-xs">
          <span className="px-3 text-[#86868B] font-mono text-[11px] uppercase">Curriculum:</span>
          {[
            level === 3 ? { lv: 3, label: 'N3 Modules (118)', count: 118 } : null,
            level >= 4 ? { lv: 4, label: 'N4 Prereq (40)', count: 40 } : null,
            { lv: 5, label: 'N5 Prereq (36)', count: 36 }
          ].filter(Boolean).map(tab => (
            <button
              key={tab.lv}
              onClick={() => {
                setActiveCurriculumLevel(tab.lv);
                setSelectedSet(0);
                setCardIdx(0);
                setQuizIdx(0);
              }}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                activeCurriculumLevel === tab.lv
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-[#86868B] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Module Selector & Navigator (Full access to all 118 modules!) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#121214] border border-[#222224] rounded-2xl">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-emerald-400 font-semibold uppercase whitespace-nowrap">
            N{activeCurriculumLevel} MODULE:
          </span>
          <select
            value={selectedSet}
            onChange={(e) => {
              setSelectedSet(Number(e.target.value));
              setCardIdx(0);
              setQuizIdx(0);
            }}
            className="bg-[#18181B] border border-[#27272A] text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-white font-mono cursor-pointer"
          >
            {sets.map((s, idx) => (
              <option key={idx} value={idx} className="bg-[#121214] text-white">
                Module {idx + 1} of {sets.length} ({s.words?.length || 20} words)
              </option>
            ))}
          </select>
        </div>

        {/* Quick Prev / Next Module Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedSet(i => Math.max(0, i - 1));
              setCardIdx(0);
              setQuizIdx(0);
            }}
            disabled={selectedSet === 0}
            className="px-3 py-1.5 bg-[#18181B] border border-[#27272A] rounded-xl text-xs text-white disabled:opacity-30 hover:bg-[#222224] font-medium"
          >
            ← Prev Module
          </button>
          <span className="text-xs font-mono text-[#86868B] px-2">
            {selectedSet + 1} / {sets.length}
          </span>
          <button
            onClick={() => {
              setSelectedSet(i => Math.min(sets.length - 1, i + 1));
              setCardIdx(0);
              setQuizIdx(0);
            }}
            disabled={selectedSet === sets.length - 1}
            className="px-3 py-1.5 bg-white text-black rounded-xl text-xs font-semibold disabled:opacity-30 hover:bg-neutral-200"
          >
            Next Module →
          </button>
        </div>
      </div>

      {/* Mode A: STUDY CARDS */}
      {mode === 'study' && (
        <div className="space-y-4">
          <div className="text-xs text-[#86868B] flex items-center justify-between pb-1">
            <span className="font-mono">Module {selectedSet + 1} • {currentWords.length} Essential Words</span>
            <button
              onClick={() => { setMode('quiz'); setQuizIdx(0); }}
              className="px-3.5 py-1 bg-white text-black font-semibold rounded-full text-xs hover:bg-neutral-200 transition-all shadow-sm flex items-center gap-1"
            >
              Start Quiz ➔
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentWords.map((item, i) => {
              const isMastered = (masteredVocab || []).includes(item.w);
              const isMissed = (mistakes || []).some(m => m.q?.includes(item.w) || m.id?.includes(item.w));

              return (
                <div
                  key={i}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    isMastered
                      ? 'bg-emerald-950/20 border-emerald-500/50 shadow-sm'
                      : isMissed
                        ? 'bg-rose-950/20 border-rose-500/50'
                        : 'bg-[#121214] border-[#222224] hover:border-[#3E3E42]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono text-[#86868B]">{item.rd}</span>
                      <div className="flex items-center gap-2">
                        {isMastered && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            ✓ Mastered
                          </span>
                        )}
                        {isMissed && !isMastered && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                            ⚠️ In Mistakes Vault
                          </span>
                        )}
                        <button
                          onClick={() => speak(item.w || item.rd)}
                          className="p-1.5 rounded-lg bg-[#1C1C1E] text-[#86868B] hover:text-white transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold font-jp text-white tracking-wide">
                      {item.w}
                    </h3>
                    <p className="text-sm text-[#E5E5E7] mt-0.5 font-sans">
                      {item.mean}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#222224] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#636366]">
                      {isMastered ? 'Recognized & Retained' : isMissed ? 'Needs Practice in Vault' : 'Unstudied'}
                    </span>
                    <button
                      onClick={() => onToggleMastered && onToggleMastered(item.w)}
                      className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-all border ${
                        isMastered
                          ? 'bg-emerald-500 text-black border-emerald-400 shadow-sm'
                          : 'bg-[#18181B] border-[#27272A] text-[#86868B] hover:text-white hover:border-[#3E3E42]'
                      }`}
                    >
                      {isMastered ? '✓ Mastered' : '+ Mark Mastered'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-6 flex justify-center">
            <button
              onClick={() => { setMode('quiz'); setQuizIdx(0); }}
              className="px-8 py-3 bg-white text-black font-semibold text-xs tracking-wide rounded-full hover:bg-neutral-200 transition-all shadow-lg"
            >
              Start Module {selectedSet + 1} Quiz Check ➔
            </button>
          </div>
        </div>
      )}

            {/* Mode C: INTERACTIVE 3D FLASHCARDS */}
      {mode === 'flashcards' && currentWords.length > 0 && (
        <div className="max-w-md mx-auto py-4 space-y-6">
          <div className="flex items-center justify-between text-xs text-[#86868B] font-mono">
            <span>CARD {cardIdx + 1} OF {currentWords.length}</span>
            <span>TAP CARD TO FLIP</span>
          </div>

          {/* Flashcard Box */}
          <div
            onClick={() => setIsFlipped(f => !f)}
            className="w-full aspect-[4/3] bg-[#121214] border border-[#27272A] hover:border-[#3E3E42] rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 shadow-2xl relative select-none"
          >
            {!isFlipped ? (
              <div className="space-y-3">
                <span className="text-xs font-mono text-[#86868B]">KANJI & READING</span>
                <div className="text-5xl font-bold font-jp text-white tracking-wide py-2">
                  {currentWords[cardIdx]?.w}
                </div>
                <div className="text-sm font-jp text-[#86868B]">
                  {currentWords[cardIdx]?.rd}
                </div>
                <p className="text-[11px] text-[#636366] font-mono pt-3">Click or tap to reveal English meaning</p>
              </div>
            ) : (
              <div className="space-y-3">
                <span className="text-xs font-mono text-emerald-400 font-semibold uppercase">ENGLISH DEFINITION</span>
                <div className="text-2xl font-bold text-white tracking-wide">
                  {currentWords[cardIdx]?.mean}
                </div>
                <div className="text-sm font-jp text-[#A1A1A6]">
                  {currentWords[cardIdx]?.w} ({currentWords[cardIdx]?.rd})
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); speak(currentWords[cardIdx]?.w || currentWords[cardIdx]?.rd); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1C1C1E] rounded-full text-xs text-[#86868B] hover:text-white mt-2"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Listen
                </button>
              </div>
            )}
          </div>

          {/* Card Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setIsFlipped(false);
                setCardIdx(i => Math.max(0, i - 1));
              }}
              disabled={cardIdx === 0}
              className="px-5 py-2.5 bg-[#161618] border border-[#27272A] text-white text-xs font-semibold rounded-full disabled:opacity-30"
            >
              ← Previous
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                speak(currentWords[cardIdx]?.w || currentWords[cardIdx]?.rd);
              }}
              className="p-3 bg-[#1C1C1E] text-white rounded-full hover:bg-[#27272A]"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onActivity && onActivity('vocab');
                setIsFlipped(false);
                setCardIdx(i => Math.min(currentWords.length - 1, i + 1));
              }}
              disabled={cardIdx === currentWords.length - 1}
              className="px-5 py-2.5 bg-white text-black text-xs font-semibold rounded-full disabled:opacity-30 hover:bg-neutral-200"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Mode B: QUIZ / TEST PHASE */}
      {mode === 'quiz' && activeQ && (
        <div className="max-w-xl mx-auto py-4 space-y-6">
          <div className="flex items-center justify-between text-xs text-[#86868B] font-mono">
            <span>QUESTION {quizIdx + 1} / {currentWords.length}</span>
            <span>SCORE: {score}</span>
          </div>

          <div className="p-8 bg-[#121214] border border-[#222224] rounded-3xl text-center space-y-3">
            <span className="px-3 py-1 bg-[#18181B] border border-[#27272A] rounded-full text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold inline-block mb-1">
              {activeQ.questionBadge}
            </span>
            {activeQ.promptReading && (
              <span className="text-xs font-mono text-[#86868B] block">
                {activeQ.promptReading}
              </span>
            )}
            <h2 className="text-4xl font-bold font-jp text-white tracking-wide py-1">
              {activeQ.promptWord}
            </h2>
            <button
              onClick={() => speak(activeQ.word)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1C1C1E] rounded-full text-xs text-[#86868B] hover:text-white transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Pronounce</span>
            </button>
          </div>

          <div className="space-y-2">
            {activeQ.options.map((opt, i) => {
              let style = "bg-[#121214] border-[#222224] text-[#E5E5E7] hover:border-[#3E3E42]";
              if (hasAnswered) {
                if (opt === activeQ.correct) {
                  style = "bg-emerald-950/30 border-emerald-500/80 text-emerald-300 font-semibold";
                } else if (opt === selectedAnswer) {
                  style = "bg-rose-950/30 border-rose-500/80 text-rose-300 font-semibold";
                } else {
                  style = "bg-[#121214]/40 border-[#222224]/40 text-[#636366]";
                }
              }

              return (
                <button
                  key={i}
                  disabled={hasAnswered}
                  onClick={() => handlePickAnswer(opt)}
                  className={`w-full p-4 rounded-2xl border text-left text-sm transition-all duration-150 flex items-center justify-between ${style}`}
                >
                  <span>{opt}</span>
                  {hasAnswered && opt === activeQ.correct && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  {hasAnswered && opt === selectedAnswer && opt !== activeQ.correct && (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {hasAnswered && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={nextQuestion}
                className="px-6 py-2.5 bg-white text-black font-semibold text-xs rounded-full hover:bg-neutral-200 transition-all"
              >
                {quizIdx + 1 === currentWords.length ? 'Finish Module' : 'Next Word ➔'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 2. GRAMMAR: LEARN PHASE (RULES, FORMULAS) + TEST
// ============================================================================
function GrammarExperience({ level, speak, onMistake }) {
  const points = useMemo(() => grammarData.filter(g => g.level === level), [level]);
  const [selectedPoint, setSelectedPoint] = useState(points[0] || null);
  useEffect(() => {
    setSelectedPoint(points[0] || null);
  }, [points]);
  const [mode, setMode] = useState('study'); // 'study' | 'flashcards' | 'quiz'
  const [cardIdx, setCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz active question
  const questions = selectedPoint?.questions || [];
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [hasPicked, setHasPicked] = useState(false);

  const curQ = questions[qIdx];

  const handlePick = (ans) => {
    if (hasPicked) return;
    setPicked(ans);
    setHasPicked(true);

    if (ans !== curQ.correct) {
      onMistake({
        id: curQ.qid,
        lv: curQ.level,
        s: 'grammar',
        t: 'gf',
        q: curQ.question,
        correct_answer: curQ.correct,
        e: curQ.explanation
      }, ans);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222224]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#86868B]">
            N{level} Grammar Architecture • {points.length} Essential Patterns
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5">
            Grammar Blueprint
          </h1>
        </div>

        <div className="flex items-center bg-[#161618] p-1 rounded-full border border-[#27272A] text-xs">
          <button
            onClick={() => setMode('study')}
            className={`px-4 py-1.5 rounded-full transition-all font-medium ${
              mode === 'study' ? 'bg-white text-black font-semibold' : 'text-[#86868B] hover:text-white'
            }`}
          >
            1. Learn Construction
          </button>
          <button
            onClick={() => { setMode('quiz'); setQIdx(0); setPicked(null); setHasPicked(false); }}
            className={`px-4 py-1.5 rounded-full transition-all font-medium ${
              mode === 'quiz' ? 'bg-white text-black font-semibold' : 'text-[#86868B] hover:text-white'
            }`}
          >
            2. Validate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Grammar Points List */}
        <div className="space-y-1.5 max-h-[72vh] overflow-y-auto pr-1">
          {points.map((p, i) => (
            <button
              key={i}
              onClick={() => { setSelectedPoint(p); setQIdx(0); setPicked(null); setHasPicked(false); }}
              className={`w-full p-3.5 rounded-2xl border text-left transition-all duration-150 flex items-center justify-between text-xs ${
                selectedPoint?.id === p.id
                  ? 'bg-white text-black border-white font-semibold'
                  : 'bg-[#121214] border-[#222224] text-[#A1A1A6] hover:text-white hover:border-[#3E3E42]'
              }`}
            >
              <div>
                <p className="font-bold font-jp text-sm tracking-wide">{p.pattern}</p>
                <p className={`text-[11px] truncate max-w-[170px] ${selectedPoint?.id === p.id ? 'text-neutral-700' : 'text-[#636366]'}`}>
                  {p.meaning}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0 opacity-60" />
            </button>
          ))}
        </div>

        {/* Right: Study Panel OR Quiz Panel */}
        <div className="md:col-span-2">
          {selectedPoint && mode === 'study' && (
            <div className="p-8 bg-[#121214] border border-[#222224] rounded-3xl space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono text-[#86868B]">
                    {selectedPoint.book_name} • Unit {selectedPoint.unit}
                  </span>
                  <h2 className="text-3xl font-bold font-jp text-white tracking-wide mt-1">
                    {selectedPoint.pattern}
                  </h2>
                  <p className="text-base text-[#D1D1D6] mt-1 font-sans">
                    {selectedPoint.meaning}
                  </p>
                </div>
                <button
                  onClick={() => speak(selectedPoint.pattern)}
                  className="p-2.5 rounded-full bg-[#1C1C1E] text-[#86868B] hover:text-white transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Formula & Rule Box */}
              <div className="p-5 bg-[#161618] border border-[#27272A] rounded-2xl space-y-2">
                <span className="text-[11px] font-mono text-[#86868B] uppercase">Grammar Rule Formula</span>
                <p className="text-sm text-white font-mono">
                  {selectedPoint.pattern}
                </p>
                <p className="text-xs text-[#86868B] pt-1">
                  Core Usage: Expresses {selectedPoint.meaning.toLowerCase()} in spoken and written JLPT contexts.
                </p>
              </div>

              {/* Example Sentences */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono text-[#86868B] uppercase">Contextual Illustrations</span>
                {questions.map((q, idx) => (
                  <div key={idx} className="p-4 bg-[#161618] border border-[#27272A] rounded-2xl space-y-1">
                    <p className="text-base font-jp text-white font-medium">
                      {q.question.replace('（　　）', `【${q.correct}】`)}
                    </p>
                    <p className="text-xs text-[#86868B] italic">{q.translation}</p>
                    <p className="text-[11px] text-[#A1A1A6] pt-1 border-t border-[#222224] mt-2">
                      💡 {q.explanation}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => { setMode('quiz'); setQIdx(0); setPicked(null); setHasPicked(false); }}
                  className="px-6 py-2.5 bg-white text-black font-semibold text-xs rounded-full hover:bg-neutral-200 transition-all"
                >
                  Test This Pattern ({questions.length} Qs) ➔
                </button>
              </div>
            </div>
          )}

          {selectedPoint && mode === 'quiz' && curQ && (
            <div className="p-8 bg-[#121214] border border-[#222224] rounded-3xl space-y-6">
              <div className="flex items-center justify-between text-xs text-[#86868B] font-mono">
                <span>QUESTION {qIdx + 1} OF {questions.length}</span>
                <span>{selectedPoint.pattern}</span>
              </div>

              <div className="py-2">
                <h3 className="text-2xl font-bold font-jp text-white leading-relaxed">
                  {curQ.question}
                </h3>
                {curQ.translation && (
                  <p className="text-xs text-[#86868B] italic mt-1">{curQ.translation}</p>
                )}
              </div>

              {/* Shuffled Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[curQ.correct, ...curQ.wrong_options].sort().map((opt, i) => {
                  let style = "bg-[#161618] border-[#27272A] text-[#E5E5E7] hover:border-[#3E3E42]";
                  if (hasPicked) {
                    if (opt === curQ.correct) {
                      style = "bg-emerald-950/30 border-emerald-500/80 text-emerald-300 font-semibold";
                    } else if (opt === picked) {
                      style = "bg-rose-950/30 border-rose-500/80 text-rose-300 font-semibold";
                    } else {
                      style = "bg-[#161618]/40 border-[#27272A]/40 text-[#636366]";
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={hasPicked}
                      onClick={() => handlePick(opt)}
                      className={`p-4 rounded-2xl border text-left text-sm font-jp transition-all flex items-center justify-between ${style}`}
                    >
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {hasPicked && (
                <div className="p-4 bg-[#161618] border border-[#27272A] rounded-2xl space-y-2 text-xs">
                  <p className="text-[#D1D1D6]">{curQ.explanation}</p>
                  {picked !== curQ.correct && curQ.notes && (
                    <p className="text-rose-400">Trap Insight: {curQ.notes[0] || 'Careful with verb form rules.'}</p>
                  )}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        if (qIdx + 1 < questions.length) {
                          setQIdx(i => i + 1);
                          setPicked(null);
                          setHasPicked(false);
                        } else {
                          alert('Grammar validation complete!');
                          setMode('study');
                        }
                      }}
                      className="px-5 py-2 bg-white text-black text-xs font-semibold rounded-full hover:bg-neutral-200"
                    >
                      {qIdx + 1 < questions.length ? 'Next Question ➔' : 'Back to Study'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. KANJI: ARCHITECTURE & LOOK-ALIKE COMPARISON ENGINE
// ============================================================================
function KanjiExperience({ level, speak, onActivity, isCumulative, masteredKanji = [], onToggleMastered, mistakes = [] }) {
  const kanjiList = useMemo(() => {
    if (isCumulative && level === 3) {
      return [...(KANJI_MAP[5] || []), ...(KANJI_MAP[4] || []), ...(KANJI_MAP[3] || [])];
    } else if (isCumulative && level === 4) {
      return [...(KANJI_MAP[5] || []), ...(KANJI_MAP[4] || [])];
    }
    return KANJI_MAP[level] || [];
  }, [level, isCumulative]);

  const [subTab, setSubTab] = useState('grid'); // 'grid' | 'flashcards'
  const [gridMode, setGridMode] = useState('all'); // 'all' | 'lookalikes'
  const [selectedKanji, setSelectedKanji] = useState(kanjiList[0] || null);

  // Look-Alike Group state
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(0);
  const activeLookalikeGroup = kanjiLookalikes[selectedGroupIdx] || kanjiLookalikes[0];

  // Build quick lookup map for any kanji to its look-alike group and partners
  const lookalikeMap = useMemo(() => {
    const map = {};
    kanjiLookalikes.forEach((g, gIdx) => {
      (g.items || []).forEach(item => {
        map[item.kanji] = {
          groupIdx: gIdx,
          tip: g.tip,
          partners: (g.items || []).filter(other => other.kanji !== item.kanji)
        };
      });
    });
    return map;
  }, []);

  // Flashcards state
  const [kanjiCardIdx, setKanjiCardIdx] = useState(0);
  const [kanjiFlipped, setKanjiFlipped] = useState(false);

  const currentConfusers = selectedKanji ? lookalikeMap[selectedKanji.kanji] : null;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222224]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#86868B]">
            {isCumulative && level < 5 ? `N5–N${level} Cumulative` : `N${level}`} • {kanjiList.length} Glyphs • 47 Look-Alike Groups
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5">
            Kanji Visual Engine
          </h1>
        </div>

        <div className="flex items-center bg-[#161618] p-1 rounded-full border border-[#27272A] text-xs">
          <button
            onClick={() => setSubTab('grid')}
            className={`px-4 py-1.5 rounded-full transition-all font-medium ${
              subTab === 'grid' ? 'bg-white text-black font-semibold' : 'text-[#86868B] hover:text-white'
            }`}
          >
            Kanji Grid
          </button>
          <button
            onClick={() => { setSubTab('flashcards'); setKanjiCardIdx(0); setKanjiFlipped(false); }}
            className={`px-4 py-1.5 rounded-full transition-all font-medium ${
              subTab === 'flashcards' ? 'bg-white text-black font-semibold' : 'text-[#86868B] hover:text-white'
            }`}
          >
            Flashcards
          </button>
        </div>
      </div>

      {/* VIEW A: KANJI GRID & INTEGRATED LOOK-ALIKES */}
      {subTab === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Glyphs list / picker (order-2 on mobile so detail card shows first without scrolling!) */}
          <div className="space-y-3 order-2 md:order-1">
            {/* Filter Toggle */}
            <div className="flex items-center bg-[#161618] p-1 rounded-xl border border-[#27272A] text-xs">
              <button
                onClick={() => setGridMode('all')}
                className={`flex-1 py-1.5 rounded-lg text-center font-medium transition-all ${
                  gridMode === 'all'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-[#86868B] hover:text-white'
                }`}
              >
                All Glyphs ({kanjiList.length})
              </button>
              <button
                onClick={() => setGridMode('lookalikes')}
                className={`flex-1 py-1.5 rounded-lg text-center font-medium transition-all ${
                  gridMode === 'lookalikes'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-[#86868B] hover:text-white'
                }`}
              >
                Look-Alikes (47)
              </button>
            </div>

            {/* List 1: All Kanji Grid */}
            {gridMode === 'all' && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[70vh] overflow-y-auto pr-1">
                {kanjiList.map((k, i) => {
                  const hasConfuser = Boolean(lookalikeMap[k.kanji]);
                  const isSelected = selectedKanji?.kanji === k.kanji;
                  const isMastered = masteredKanji.includes(k.kanji);
                  const isMissed = mistakes.some(m => m.q?.includes(k.kanji));

                  return (
                    <button
                      key={i}
                      onClick={() => { onActivity && onActivity('kanji'); setSelectedKanji(k); speak(k.kanji); }}
                      className={`aspect-square rounded-2xl border text-xl font-jp font-bold flex flex-col items-center justify-center transition-all relative ${
                        isSelected
                          ? 'bg-white text-black border-white shadow-lg'
                          : isMastered
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300 hover:border-emerald-400'
                            : isMissed
                              ? 'bg-rose-950/20 border-rose-500/50 text-rose-300 hover:border-rose-400'
                              : 'bg-[#121214] border-[#222224] text-[#A1A1A6] hover:text-white hover:border-[#3E3E42]'
                      }`}
                    >
                      <span>{k.kanji}</span>
                      
                      {/* Top right: Mastered green dot */}
                      {isMastered && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1.5 right-1.5" title="Mastered" />
                      )}

                      {/* Top left: Missed red dot */}
                      {isMissed && !isMastered && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute top-1.5 left-1.5" title="Vulnerability in Mistakes Vault" />
                      )}

                      {/* Bottom center: Look-alike confuser dot */}
                      {hasConfuser && (
                        <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${isSelected ? 'bg-black' : 'bg-amber-400'}`} title="Has easily confused look-alike" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* List 2: Look-Alike Groups List */}
            {gridMode === 'lookalikes' && (
              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                {kanjiLookalikes.map((group, idx) => {
                  const isSelected = selectedGroupIdx === idx;
                  const chars = (group.items || []).map(item => item.kanji).join('  vs  ');
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        onActivity && onActivity('kanji');
                        setSelectedGroupIdx(idx);
                        // Also select the first item of this group for detail view
                        const first = group.items?.[0];
                        if (first) {
                          setSelectedKanji({
                            kanji: first.kanji,
                            meaning: first.meaning,
                            components: first.parts,
                            story: first.story,
                            onyomi: first.on || [],
                            kunyomi: first.kun || []
                          });
                        }
                      }}
                      className={`w-full p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-white text-black border-white shadow-md'
                          : 'bg-[#121214] border-[#222224] text-[#A1A1A6] hover:text-white hover:border-[#3E3E42]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold font-jp tracking-wider">
                          {chars}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isSelected ? 'bg-black/10 text-black' : 'bg-[#1C1C1E] text-[#86868B]'}`}>
                          Group #{idx + 1}
                        </span>
                      </div>
                      <p className={`text-[11px] mt-1 line-clamp-1 italic ${isSelected ? 'text-black/80' : 'text-[#86868B]'}`}>
                        {group.tip}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Kanji Detail & Look-Alike Comparative Anatomy (order-1 on mobile so it's always at the top without scrolling!) */}
          <div className="md:col-span-2 space-y-6 order-1 md:order-2 md:sticky md:top-20 md:self-start">
            {/* If in Look-Alikes mode, show Side-by-Side Comparison card */}
            {gridMode === 'lookalikes' && activeLookalikeGroup && (
              <div className="p-6 bg-[#121214] border border-[#222224] rounded-3xl space-y-5">
                <div className="flex items-center justify-between border-b border-[#222224] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300">
                      LOOK-ALIKE COMPARISON #{selectedGroupIdx + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedGroupIdx(i => Math.max(0, i - 1))}
                      disabled={selectedGroupIdx === 0}
                      className="px-3 py-1 bg-[#161618] border border-[#27272A] rounded-full text-white text-xs disabled:opacity-30"
                    >
                      ← Prev Group
                    </button>
                    <button
                      onClick={() => setSelectedGroupIdx(i => Math.min(kanjiLookalikes.length - 1, i + 1))}
                      disabled={selectedGroupIdx === kanjiLookalikes.length - 1}
                      className="px-3 py-1 bg-white text-black font-semibold rounded-full text-xs hover:bg-neutral-200"
                    >
                      Next Group →
                    </button>
                  </div>
                </div>

                {/* Side-by-side glyphs */}
                <div className={`grid grid-cols-1 sm:grid-cols-${Math.min(activeLookalikeGroup.items?.length || 2, 4)} gap-4`}>
                  {(activeLookalikeGroup.items || []).map((k, idx) => (
                    <div
                      key={idx}
                      className="p-5 bg-[#161618] border border-[#27272A] rounded-2xl text-center space-y-3"
                    >
                      <div className="text-6xl font-bold font-jp text-white py-1">
                        {k.kanji}
                      </div>
                      <h4 className="text-base font-bold text-white capitalize">{k.meaning}</h4>
                      <div className="p-2 bg-[#1C1C1E] rounded-xl text-xs space-y-1 text-left font-mono">
                        <span className="text-amber-400 font-semibold block text-[11px]">Radical / Parts:</span>
                        <span className="text-white text-[11px] block">{k.parts}</span>
                      </div>
                      <p className="text-xs text-[#86868B] italic text-left leading-relaxed">
                        "{k.story}"
                      </p>
                      <button
                        onClick={() => speak(k.kanji)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1C1C1E] text-xs text-[#86868B] hover:text-white rounded-full transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Pronounce
                      </button>
                    </div>
                  ))}
                </div>

                {/* Crucial Differentiating Tip */}
                <div className="p-4 bg-[#18181B] border border-amber-400/30 rounded-2xl text-xs text-[#E5E5E7] space-y-1">
                  <span className="text-amber-400 font-semibold uppercase font-mono block text-[10px]">
                    DISCERNMENT STRATEGY (HOW TO NEVER CONFUSE THEM):
                  </span>
                  <p className="leading-relaxed">
                    {activeLookalikeGroup.tip}
                  </p>
                </div>
              </div>
            )}

            {/* Standard Kanji Anatomy Detail Panel */}
            {selectedKanji && (
              <div className="p-8 bg-[#121214] border border-[#222224] rounded-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#86868B]">
                        {selectedKanji.strokes ? `${selectedKanji.strokes} Strokes • ` : ''}JLPT Glyph
                      </span>
                      {masteredKanji.includes(selectedKanji.kanji) && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          ✓ Mastered
                        </span>
                      )}
                      {mistakes.some(m => m.q?.includes(selectedKanji.kanji)) && !masteredKanji.includes(selectedKanji.kanji) && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                          ⚠️ Vulnerability in Vault
                        </span>
                      )}
                    </div>
                    <div className="text-7xl font-bold font-jp text-white py-2">
                      {selectedKanji.kanji}
                    </div>
                    <h3 className="text-2xl font-bold text-white capitalize">
                      {selectedKanji.meaning || selectedKanji.meanings?.join(', ')}
                    </h3>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => speak(selectedKanji.kanji)}
                      className="p-3 bg-[#1C1C1E] text-[#86868B] hover:text-white rounded-full transition-colors"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onToggleMastered && onToggleMastered(selectedKanji.kanji)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all border ${
                        masteredKanji.includes(selectedKanji.kanji)
                          ? 'bg-emerald-500 text-black border-emerald-400 shadow-sm'
                          : 'bg-[#18181B] border-[#27272A] text-[#86868B] hover:text-white'
                      }`}
                    >
                      {masteredKanji.includes(selectedKanji.kanji) ? '✓ Mastered' : 'Mark Mastered'}
                    </button>
                  </div>
                </div>

                {/* Radical Decomposition & Visual Mnemonic */}
                <div className="p-5 bg-[#161618] border border-[#27272A] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-[#222224] pb-2">
                    <span className="text-[11px] font-mono text-amber-400 font-semibold uppercase tracking-wider">
                      RADICAL DECOMPOSITION
                    </span>
                    <span className="text-xs text-white font-jp font-bold bg-[#222224] px-2.5 py-0.5 rounded-full">
                      {selectedKanji.components || selectedKanji.parts || 'Primary Radical Form'}
                    </span>
                  </div>
                  {selectedKanji.story && (
                    <div>
                      <span className="text-[10px] font-mono text-[#86868B] uppercase block mb-1">
                        VISUAL MNEMONIC
                      </span>
                      <p className="text-sm text-[#E5E5E7] leading-relaxed font-sans italic">
                        "{selectedKanji.story}"
                      </p>
                    </div>
                  )}
                </div>

                {/* On'yomi & Kun'yomi Readings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#161618] border border-[#27272A] rounded-2xl">
                    <span className="text-[11px] font-mono text-[#86868B] block mb-1">ON'YOMI (CHINESE READING)</span>
                    <p className="text-base font-jp font-semibold text-white">
                      {selectedKanji.onyomi?.join(' • ') || selectedKanji.on?.join(' • ') || selectedKanji.onyomi_raw || '—'}
                    </p>
                  </div>
                  <div className="p-4 bg-[#161618] border border-[#27272A] rounded-2xl">
                    <span className="text-[11px] font-mono text-[#86868B] block mb-1">KUN'YOMI (JAPANESE READING)</span>
                    <p className="text-base font-jp font-semibold text-white">
                      {selectedKanji.kunyomi?.join(' • ') || selectedKanji.kun?.join(' • ') || selectedKanji.kunyomi_raw || '—'}
                    </p>
                  </div>
                </div>

                {/* INLINE LOOK-ALIKE CONFUSER INTEGRATION */}
                {currentConfusers && currentConfusers.partners.length > 0 && (
                  <div className="p-5 bg-[#18181B] border border-amber-400/30 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        ⚠️ EASILY CONFUSED LOOK-ALIKES
                      </span>
                      <span className="text-[11px] text-[#86868B] font-mono">
                        Click partner to inspect
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentConfusers.partners.map((partner, pIdx) => (
                        <div
                          key={pIdx}
                          onClick={() => {
                            // Find partner in kanjiList, or create a quick preview
                            const found = kanjiList.find(k => k.kanji === partner.kanji);
                            if (found) {
                              setSelectedKanji(found);
                            } else {
                              setSelectedKanji({
                                kanji: partner.kanji,
                                meaning: partner.meaning,
                                components: partner.parts,
                                story: partner.story,
                                onyomi: partner.on || [],
                                kunyomi: partner.kun || []
                              });
                            }
                            speak(partner.kanji);
                          }}
                          className="p-4 bg-[#121214] border border-[#27272A] hover:border-amber-400/60 rounded-xl cursor-pointer transition-all flex items-center gap-4"
                        >
                          <div className="text-4xl font-bold font-jp text-white">
                            {partner.kanji}
                          </div>
                          <div className="space-y-0.5 text-xs">
                            <span className="text-white font-semibold block capitalize">{partner.meaning}</span>
                            <span className="text-[11px] text-amber-400/90 font-mono block">Radical: {partner.parts}</span>
                            <span className="text-[10px] text-[#86868B] block italic line-clamp-1">{partner.story}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-[#A1A1A6] italic pt-1 border-t border-[#27272A] leading-relaxed">
                      💡 Tip: {currentConfusers.tip}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW B: INTERACTIVE FLASHCARDS */}
      {subTab === 'flashcards' && kanjiList.length > 0 && (
        <div className="max-w-md mx-auto py-4 space-y-6">
          <div className="flex items-center justify-between text-xs text-[#86868B] font-mono">
            <span>KANJI {kanjiCardIdx + 1} OF {kanjiList.length}</span>
            <span>TAP TO FLIP</span>
          </div>

          <div
            onClick={() => setKanjiFlipped(f => !f)}
            className="w-full aspect-[4/3] bg-[#121214] border border-[#27272A] hover:border-[#3E3E42] rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 shadow-2xl relative select-none"
          >
            {!kanjiFlipped ? (
              <div className="space-y-3">
                <span className="text-xs font-mono text-[#86868B]">{kanjiList[kanjiCardIdx]?.strokes ? `${kanjiList[kanjiCardIdx].strokes} Strokes` : `N${level}`}</span>
                <div className="text-7xl font-bold font-jp text-white py-2">
                  {kanjiList[kanjiCardIdx]?.kanji}
                </div>
                <p className="text-[11px] text-[#636366] font-mono pt-3">Click to reveal readings & radical breakdown</p>
              </div>
            ) : (
              <div className="space-y-3">
                <span className="text-xs font-mono text-emerald-400 font-semibold uppercase">MEANING & READINGS</span>
                <div className="text-2xl font-bold text-white capitalize">
                  {kanjiList[kanjiCardIdx]?.meaning || kanjiList[kanjiCardIdx]?.meanings?.join(', ')}
                </div>
                <div className="text-xs font-mono text-[#A1A1A6]">
                  On: {kanjiList[kanjiCardIdx]?.onyomi?.join(' • ') || kanjiList[kanjiCardIdx]?.on?.join(' • ') || '—'}
                </div>
                <div className="text-xs font-mono text-[#A1A1A6]">
                  Kun: {kanjiList[kanjiCardIdx]?.kunyomi?.join(' • ') || kanjiList[kanjiCardIdx]?.kun?.join(' • ') || '—'}
                </div>
                {kanjiList[kanjiCardIdx]?.components && (
                  <p className="text-xs font-mono text-amber-400/90 pt-1">
                    Radical: {kanjiList[kanjiCardIdx].components}
                  </p>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); speak(kanjiList[kanjiCardIdx]?.kanji); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1C1C1E] rounded-full text-xs text-[#86868B] hover:text-white mt-1"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Listen
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setKanjiFlipped(false);
                setKanjiCardIdx(i => Math.max(0, i - 1));
              }}
              disabled={kanjiCardIdx === 0}
              className="px-5 py-2.5 bg-[#161618] border border-[#27272A] text-white text-xs font-semibold rounded-full disabled:opacity-30"
            >
              ← Previous
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                speak(kanjiList[kanjiCardIdx]?.kanji);
              }}
              className="p-3 bg-[#1C1C1E] text-white rounded-full hover:bg-[#27272A]"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onActivity && onActivity('kanji');
                setKanjiFlipped(false);
                setKanjiCardIdx(i => Math.min(kanjiList.length - 1, i + 1));
              }}
              disabled={kanjiCardIdx === kanjiList.length - 1}
              className="px-5 py-2.5 bg-white text-black text-xs font-semibold rounded-full disabled:opacity-30 hover:bg-neutral-200"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 4. OFFICIAL JLPT MOCK EXAMS & PRACTICE DRILLS (WITH LOBBY & SCORE TRACKING)
// ============================================================================
function ExamExperience({ level, speak, onMistake, askAi, onActivity }) {
  const allQuestions = useMemo(() => examQuestions.filter(q => q.lv === level), [level]);

  // Divide into 25-question mock tests cleanly (appending remainder to last test)
  const mockTests = useMemo(() => {
    const tests = [];
    const chunkSize = 25;
    for (let i = 0; i < allQuestions.length; i += chunkSize) {
      const chunk = allQuestions.slice(i, i + chunkSize);
      if (chunk.length < 15 && tests.length > 0) {
        tests[tests.length - 1].questions.push(...chunk);
      } else {
        tests.push({
          id: tests.length + 1,
          name: `Official Mock Exam #${tests.length + 1}`,
          questions: chunk
        });
      }
    }
    return tests;
  }, [allQuestions]);

  // LocalStorage score tracking for each exam
  const [examScores, setExamScores] = useState(() => {
    try {
      const saved = localStorage.getItem('kz_mock_scores');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // activeTestId: null = in Lobby; number (1..N) = inside active exam
  const [activeTestId, setActiveTestId] = useState(null);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qIdx]: selectedOption }
  const [isExamCompleted, setIsExamCompleted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30 * 60);

  const activeTest = useMemo(() => {
    if (!activeTestId) return null;
    return mockTests.find(t => t.id === activeTestId) || mockTests[0];
  }, [activeTestId, mockTests]);

  const questions = activeTest?.questions || [];
  const curQ = questions[qIdx] || questions[0];

  // Timer countdown while exam is in progress
  useEffect(() => {
    if (!activeTestId || isExamCompleted) return;
    const interval = setInterval(() => {
      setSecondsRemaining(s => {
        if (s <= 1) {
          submitExam();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTestId, isExamCompleted]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const startExam = (testId) => {
    setActiveTestId(testId);
    setQIdx(0);
    setAnswers({});
    setIsExamCompleted(false);
    setSecondsRemaining(30 * 60);
  };

  const exitToLobby = () => {
    if (!isExamCompleted && Object.keys(answers).length > 0) {
      if (!window.confirm("Exit exam? Your in-progress answers for this attempt will not be saved.")) {
        return;
      }
    }
    setActiveTestId(null);
    setIsExamCompleted(false);
  };

  const handleSelectOption = (opt) => {
    onActivity && onActivity('drills');
    setAnswers(prev => ({ ...prev, [qIdx]: opt }));
  };

  const submitExam = () => {
    let score = 0;
    questions.forEach((q, i) => {
      const chosen = answers[i];
      if (chosen === q.correct_answer) {
        score++;
      } else {
        onMistake(q, chosen || 'Unanswered');
      }
    });

    const percentage = Math.round((score / questions.length) * 100);
    const isPassed = percentage >= 60;

    const examKey = `n${level}_test_${activeTestId}`;
    const record = {
      score,
      total: questions.length,
      percentage,
      passed: isPassed,
      date: new Date().toLocaleDateString()
    };

    const updated = { ...examScores, [examKey]: record };
    setExamScores(updated);
    try {
      localStorage.setItem('kz_mock_scores', JSON.stringify(updated));
    } catch (e) {}

    setIsExamCompleted(true);
  };

  // Lobby Metrics
  const completedCount = useMemo(() => {
    return mockTests.filter(t => examScores[`n${level}_test_${t.id}`]).length;
  }, [mockTests, examScores, level]);

  const avgAccuracy = useMemo(() => {
    const records = mockTests
      .map(t => examScores[`n${level}_test_${t.id}`])
      .filter(Boolean);
    if (!records.length) return 0;
    const sum = records.reduce((acc, r) => acc + r.percentage, 0);
    return Math.round(sum / records.length);
  }, [mockTests, examScores, level]);

  // ==========================================================================
  // VIEW 1: EXAM LOBBY (SELECT & START)
  // ==========================================================================
  if (!activeTestId) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Lobby Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222224]">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#86868B]">
              JLPT N{level} Simulation Center • {mockTests.length} Full Mock Exams
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5">
              Official Mock Exam Hub
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-500/40 px-3 py-1.5 rounded-full">
              {completedCount} / {mockTests.length} Completed
            </span>
            {completedCount > 0 && (
              <span className="text-xs font-mono text-cyan-300 font-semibold bg-cyan-950/40 border border-cyan-500/40 px-3 py-1.5 rounded-full">
                {avgAccuracy}% Avg Score
              </span>
            )}
          </div>
        </div>

        {/* Overview Banner */}
        <div className="p-6 bg-[#121214] border border-[#222224] rounded-3xl relative overflow-hidden space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase bg-white/10 text-white">
              Official JLPT Standards
            </span>
            <span className="text-xs font-mono text-[#86868B]">
              30 Mins • 25–34 Questions • Passing Mark 60%
            </span>
          </div>
          <p className="text-xs text-[#A1A1A6] leading-relaxed max-w-2xl">
            Each exam simulates actual JLPT testing conditions. Your score, accuracy percentage, and completion date are saved. Missed questions are automatically Triaged to your <strong>Mistakes Vault</strong> for deep forensic autopsy.
          </p>
        </div>

        {/* Mock Exam Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockTests.map((test) => {
            const scoreRecord = examScores[`n${level}_test_${test.id}`];
            const isDone = Boolean(scoreRecord);
            const isPassed = scoreRecord?.passed;

            return (
              <div
                key={test.id}
                className={`p-6 bg-[#121214] border rounded-3xl flex flex-col justify-between space-y-5 transition-all hover:border-[#3E3E42] ${
                  isDone
                    ? isPassed
                      ? 'border-emerald-500/40 shadow-sm'
                      : 'border-rose-500/40'
                    : 'border-[#222224]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#86868B] uppercase">
                      JLPT N{level}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      isDone
                        ? isPassed
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                        : 'bg-[#1C1C1E] text-[#86868B]'
                    }`}>
                      {isDone ? (isPassed ? '✓ Passed' : '✗ Failed') : 'Unattempted'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {test.name}
                    </h3>
                    <p className="text-xs text-[#86868B] font-mono mt-0.5">
                      {test.questions.length} Questions • 30 Minutes
                    </p>
                  </div>

                  {/* Previous Score Display */}
                  {isDone ? (
                    <div className="p-3 bg-[#161618] border border-[#27272A] rounded-2xl text-xs flex items-center justify-between">
                      <span className="text-[#86868B]">Best Score:</span>
                      <span className="font-mono font-bold text-white">
                        {scoreRecord.score} / {scoreRecord.total} ({scoreRecord.percentage}%)
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-[#161618] border border-[#27272A] rounded-2xl text-xs text-[#636366] italic">
                      Ready to test your readiness.
                    </div>
                  )}
                </div>

                {/* Start / Retake Action Button */}
                <button
                  onClick={() => startExam(test.id)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold font-mono transition-all flex items-center justify-center gap-2 ${
                    isDone
                      ? 'bg-[#1C1C1E] border border-[#27272A] text-white hover:bg-[#27272A]'
                      : 'bg-white text-black hover:bg-neutral-200 shadow-md font-bold'
                  }`}
                >
                  <span>{isDone ? 'Retake Exam' : 'Start Exam'}</span>
                  <span>➔</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================================================
  // VIEW 2: EXAM COMPLETED (SCORE REPORT)
  // ==========================================================================
  if (isExamCompleted) {
    const score = Object.keys(answers).reduce((acc, i) => {
      return acc + (answers[i] === questions[i]?.correct_answer ? 1 : 0);
    }, 0);
    const percentage = Math.round((score / questions.length) * 100);
    const isPassed = percentage >= 60;

    return (
      <div className="max-w-2xl mx-auto py-6 space-y-6 animate-in fade-in duration-300">
        <div className="p-8 bg-[#121214] border border-[#222224] rounded-3xl space-y-6 text-center shadow-2xl">
          <div className="space-y-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
              isPassed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}>
              {isPassed ? '✓ JLPT QUALIFIED (PASS)' : '✗ BELOW PASSING STANDARD'}
            </span>
            <h2 className="text-5xl font-extrabold text-white tracking-tight">
              {score} / {questions.length}
            </h2>
            <p className="text-sm font-mono text-[#86868B]">
              Accuracy: {percentage}% • Passing Standard: 60%
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto text-xs font-mono">
            <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-xl">
              <span className="text-[#86868B] block">QUESTIONS</span>
              <span className="text-white font-bold text-base">{questions.length}</span>
            </div>
            <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-xl">
              <span className="text-emerald-400 block">CORRECT</span>
              <span className="text-white font-bold text-base">{score}</span>
            </div>
            <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-xl">
              <span className="text-rose-400 block">MISSED</span>
              <span className="text-white font-bold text-base">{questions.length - score}</span>
            </div>
            <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-xl">
              <span className="text-amber-400 block">TIME USED</span>
              <span className="text-white font-bold text-base">{formatTime(30 * 60 - secondsRemaining)}</span>
            </div>
          </div>

          <p className="text-xs text-[#86868B] italic">
            All missed questions have been logged to your <strong>Mistakes Vault</strong> for deep forensic analysis.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => startExam(activeTestId)}
              className="px-5 py-2.5 bg-[#18181B] border border-[#27272A] text-white text-xs font-semibold rounded-full hover:bg-[#222224]"
            >
              Retake This Exam
            </button>
            <button
              onClick={exitToLobby}
              className="px-5 py-2.5 bg-white text-black text-xs font-semibold rounded-full hover:bg-neutral-200 font-bold"
            >
              Return to Exam Hub →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // VIEW 3: ACTIVE EXAM IN PROGRESS
  // ==========================================================================
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Active Exam Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#222224]">
        <div className="flex items-center gap-3">
          <button
            onClick={exitToLobby}
            className="px-3 py-1.5 bg-[#161618] border border-[#27272A] text-[#86868B] hover:text-white rounded-full text-xs font-mono font-medium transition-colors"
          >
            ← Exit to Hub
          </button>
          <div>
            <span className="text-[10px] font-mono uppercase text-[#86868B] block">JLPT N{level} SIMULATION</span>
            <h2 className="text-lg font-bold text-white">{activeTest.name}</h2>
          </div>
        </div>

        {/* Live Countdown Timer & Submit Button */}
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold font-mono px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
            secondsRemaining < 300 
              ? 'bg-rose-950/50 border-rose-500/70 text-rose-400 animate-pulse'
              : 'bg-[#161618] border-[#27272A] text-white'
          }`}>
            <span>⏱</span>
            <span>{formatTime(secondsRemaining)}</span>
          </span>

          <button
            onClick={() => {
              const answeredCount = Object.keys(answers).length;
              if (answeredCount < questions.length) {
                if (!window.confirm(`You have only answered ${answeredCount} of ${questions.length} questions. Submit anyway?`)) {
                  return;
                }
              }
              submitExam();
            }}
            className="px-4 py-1.5 bg-white text-black font-semibold text-xs rounded-xl hover:bg-neutral-200 shadow-sm"
          >
            Submit Exam
          </button>
        </div>
      </div>

      {/* Question Palette / Navigator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#86868B] font-mono">
          <span>QUESTION {qIdx + 1} OF {questions.length}</span>
          <span>ANSWERED: {Object.keys(answers).length} / {questions.length}</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {questions.map((_, i) => {
            const isAnswered = answers[i] !== undefined;
            const isCurrent = qIdx === i;
            return (
              <button
                key={i}
                onClick={() => setQIdx(i)}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-medium flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-white text-black font-bold shadow-md'
                    : isAnswered
                      ? 'bg-[#27272A] text-white border border-[#3E3E42]'
                      : 'bg-[#121214] text-[#636366] hover:text-white border border-[#222224]'
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Card */}
      <div className="p-8 bg-[#121214] border border-[#222224] rounded-3xl space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase text-[#86868B] px-2.5 py-1 bg-[#1C1C1E] rounded-md">
            Section: {curQ.s?.toUpperCase()} • Type: {curQ.t}
          </span>
          <button
            onClick={() => speak(curQ.q)}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#1C1C1E] hover:bg-[#27272A] text-xs text-[#86868B] hover:text-white rounded-full transition-colors font-mono"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Audio</span>
          </button>
        </div>

        {curQ.intro && (
          <div className="p-3 bg-[#161618] border border-[#27272A] rounded-xl text-xs text-[#A1A1A6] italic font-jp">
            {curQ.intro}
          </div>
        )}

        <h2 
          className="text-2xl font-bold font-jp text-white leading-relaxed"
          dangerouslySetInnerHTML={{ __html: curQ.q }}
        />
        {curQ.tr && (
          <p className="text-xs text-[#86868B] italic -mt-2">{curQ.tr}</p>
        )}

        {/* Options */}
        <div className="space-y-2.5 pt-2">
          {(curQ.o || curQ.options || []).map((opt, i) => {
            const isSelected = answers[qIdx] === opt;
            return (
              <button
                key={i}
                onClick={() => handleSelectOption(opt)}
                className={`w-full p-4 rounded-2xl border text-left text-sm font-jp transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-white/10 border-white text-white font-semibold'
                    : 'bg-[#161618] border-[#27272A] text-[#E5E5E7] hover:border-[#3E3E42]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#1C1C1E] border border-[#27272A] flex items-center justify-center text-xs font-mono text-[#86868B]">
                    {i + 1}
                  </span>
                  <span>{opt}</span>
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setQIdx(i => Math.max(0, i - 1))}
          disabled={qIdx === 0}
          className="px-5 py-2.5 bg-[#161618] border border-[#27272A] text-white text-xs font-semibold rounded-full disabled:opacity-30"
        >
          ← Previous Question
        </button>

        <button
          onClick={() => {
            if (qIdx + 1 < questions.length) {
              setQIdx(i => i + 1);
            } else {
              submitExam();
            }
          }}
          className="px-5 py-2.5 bg-white text-black text-xs font-semibold rounded-full hover:bg-neutral-200"
        >
          {qIdx + 1 < questions.length ? 'Next Question →' : 'Submit Exam →'}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 5. MISTAKE VAULT
// ============================================================================
function VaultExperience({ mistakes, level, speak, onResolve, askAi }) {
  if (mistakes.length === 0) {
    return (
      <div className="p-16 text-center bg-[#121214] border border-[#222224] rounded-3xl space-y-3">
        <span className="w-12 h-12 rounded-full bg-[#1C1C1E] flex items-center justify-center mx-auto text-emerald-400">
          <Check className="w-6 h-6" />
        </span>
        <h3 className="text-lg font-semibold text-white">Mistake Vault Empty</h3>
        <p className="text-xs text-[#86868B] max-w-sm mx-auto">
          Every question you miss in Vocabulary, Grammar, or Exam mode will be archived here for deep forensic review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#222224]">
        <div>
          <span className="text-[11px] font-mono uppercase text-[#86868B]">Triage Engine</span>
          <h2 className="text-xl font-bold text-white">Archived Vulnerabilities ({mistakes.length})</h2>
        </div>
      </div>

      <div className="space-y-3">
        {mistakes.map((m, i) => (
          <div key={i} className="p-5 bg-[#121214] border border-[#222224] rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[#86868B] uppercase">{m.s} • {m.t}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => speak(m.q)}
                  className="p-1.5 bg-[#1C1C1E] text-[#86868B] hover:text-white rounded-lg"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onResolve(m.id)}
                  className="px-3 py-1 bg-[#1C1C1E] text-white hover:bg-neutral-800 text-xs font-medium rounded-full"
                >
                  Mark Cleared
                </button>
              </div>
            </div>

            <h4 className="text-lg font-bold font-jp text-white" dangerouslySetInnerHTML={{ __html: m.q }} />

            <div className="p-3 bg-[#161618] border border-[#27272A] rounded-xl text-xs space-y-1">
              <p className="text-emerald-400 font-semibold">Correct: {m.correct_answer}</p>
              {m.picked && <p className="text-rose-400">You picked: {m.picked}</p>}
              <p className="text-[#A1A1A6] pt-1">{m.e}</p>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => askAi(m, m.picked || 'Incorrect option')}
                className="text-xs text-white hover:underline flex items-center gap-1 font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Forensic Breakdown ➔</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export default App;
export { App };
