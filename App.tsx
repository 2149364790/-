import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ChevronRight, ChevronLeft, Bot, Terminal, Code2, Database, Key } from 'lucide-react';
import SimulationDiagram from './components/SimulationDiagram';
import { LOGIN_STEPS, FETCH_STEPS } from './constants';
import { SimulationStep, ScenarioType, ChatMessage } from './types';
import { explainConcept } from './services/geminiService';

const App: React.FC = () => {
  const [scenario, setScenario] = useState<ScenarioType>('LOGIN');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Ref for auto-scrolling chat
  const chatEndRef = useRef<HTMLDivElement>(null);

  const steps = scenario === 'LOGIN' ? LOGIN_STEPS : FETCH_STEPS;
  const currentStep = steps[currentStepIndex];
  const prevStep = currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;

  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setMessages([]); // Clear chat on scenario switch
  }, [scenario]);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 3000); // 3 seconds per step
    }
    return () => clearInterval(interval);
  }, [isPlaying, steps.length]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) setCurrentStepIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(prev => prev - 1);
  };

  const handleAskAI = async () => {
    const concept = currentStep.title;
    const context = currentStep.description + " 代码: " + currentStep.codeContent;
    
    setMessages(prev => [...prev, { role: 'user', text: `能解释一下"${concept}"的原理吗？` }]);
    setIsAiLoading(true);

    const answer = await explainConcept(concept, context);
    
    setMessages(prev => [...prev, { role: 'model', text: answer }]);
    setIsAiLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Database className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                FullStack Flow Sim
              </h1>
              <p className="text-xs text-slate-400">Vue3 + SpringBoot + MyBatis-Plus 交互演示</p>
            </div>
          </div>

          <div className="flex bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setScenario('LOGIN')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                scenario === 'LOGIN' 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2"><Key size={14} /> 登录 (Token获取)</span>
            </button>
            <button
              onClick={() => setScenario('FETCH_DATA')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                scenario === 'FETCH_DATA' 
                  ? 'bg-emerald-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2"><Database size={14} /> 数据请求 (Token使用)</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Visuals & Code (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Controls & Progress */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  {isPlaying ? <span className="block w-3 h-3 bg-white rounded-sm"></span> : <Play size={18} fill="currentColor" />}
                </button>
                <button 
                  onClick={() => { setCurrentStepIndex(0); setIsPlaying(false); }}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                >
                  <RotateCcw size={18} />
                </button>
             </div>
             
             <div className="flex-1 mx-8">
               <div className="flex justify-between text-xs text-slate-400 mb-2">
                 <span>Step {currentStepIndex + 1} / {steps.length}</span>
                 <span className="text-indigo-400 font-medium">{currentStep.title}</span>
               </div>
               <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500 ease-out"
                   style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                 />
               </div>
             </div>

             <div className="flex gap-2">
               <button 
                 onClick={handlePrev}
                 disabled={currentStepIndex === 0}
                 className="p-2 rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-30 transition"
               >
                 <ChevronLeft size={20} />
               </button>
               <button 
                 onClick={handleNext}
                 disabled={currentStepIndex === steps.length - 1}
                 className="p-2 rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-30 transition"
               >
                 <ChevronRight size={20} />
               </button>
             </div>
          </div>

          {/* Diagram */}
          <SimulationDiagram step={currentStep} prevStep={prevStep} />

          {/* Code & Data Split View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
            {/* Logic Code Block */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-lg">
              <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <Code2 size={14} className="text-blue-400" />
                  {currentStep.codeLang === 'java' ? 'Java Backend' : currentStep.codeLang === 'javascript' ? 'Vue Client' : currentStep.codeLang === 'sql' ? 'MySQL Query' : 'HTTP'}
                </span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                  {currentStep.activeComponent}
                </span>
              </div>
              <div className="flex-1 p-4 overflow-auto font-mono text-sm">
                <pre className="text-slate-300">
                  <code>{currentStep.codeContent}</code>
                </pre>
              </div>
            </div>

            {/* Data Payload Block */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-lg">
              <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <Terminal size={14} className="text-emerald-400" />
                  {currentStep.payloadType} Data
                </span>
              </div>
              <div className="flex-1 p-4 overflow-auto font-mono text-sm">
                <pre className="text-emerald-300/90">
                  <code>{currentStep.payloadContent}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Explanation & AI (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-[calc(100vh-8rem)] sticky top-24">
          
          {/* Step Explanation Card */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-xl">
             <h2 className="text-xl font-bold text-white mb-2">{currentStep.title}</h2>
             <p className="text-slate-400 leading-relaxed text-sm">
               {currentStep.description}
             </p>
             <div className="mt-4 pt-4 border-t border-slate-700/50">
               <button
                 onClick={handleAskAI}
                 disabled={isAiLoading}
                 className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
               >
                 <Bot size={18} />
                 {isAiLoading ? 'AI 正在思考...' : 'AI 助教：深度解析此步骤'}
               </button>
             </div>
          </div>

          {/* AI Chat History */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-inner">
             <div className="p-3 border-b border-slate-800 bg-slate-900 text-xs font-medium text-slate-400 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               Gemini AI 实时问答
             </div>
             <div className="flex-1 p-4 overflow-y-auto space-y-4">
               {messages.length === 0 && (
                 <div className="text-center text-slate-600 mt-10 text-sm">
                   <p>点击上方按钮，让 AI 解释技术细节。</p>
                   <p className="mt-2 text-xs opacity-60">例如：为什么要用 Token？MyBatis Wrapper 是什么？</p>
                 </div>
               )}
               {messages.map((msg, idx) => (
                 <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] rounded-xl p-3 text-sm ${
                     msg.role === 'user' 
                       ? 'bg-indigo-600 text-white rounded-tr-none' 
                       : 'bg-slate-800 text-slate-300 rounded-tl-none border border-slate-700'
                   }`}>
                     {msg.role === 'model' ? (
                        <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-300">$1</strong>') }} />
                     ) : msg.text}
                   </div>
                 </div>
               ))}
               <div ref={chatEndRef} />
             </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;