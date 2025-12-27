import React from 'react';
import { Database, Server, Monitor, ArrowRight, ShieldCheck, FileJson, LayoutList } from 'lucide-react';
import { SimulationStep, EntityType } from '../types';

interface Props {
  step: SimulationStep;
  prevStep: SimulationStep | null;
}

const SimulationDiagram: React.FC<Props> = ({ step, prevStep }) => {
  
  // Helper to determine opacity/highlight based on current simulation state
  const getEntityStyle = (type: EntityType) => {
    const isActive = step.source === type || step.target === type;
    const baseClass = "relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-500 w-40 h-40";
    
    if (type === 'CLIENT') {
      return `${baseClass} ${isActive ? 'bg-emerald-900/30 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-slate-900 border-slate-700 opacity-60'}`;
    }
    if (type === 'SERVER') {
      return `${baseClass} ${isActive ? 'bg-indigo-900/30 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'bg-slate-900 border-slate-700 opacity-60'}`;
    }
    if (type === 'DATABASE') {
      return `${baseClass} ${isActive ? 'bg-amber-900/30 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-slate-900 border-slate-700 opacity-60'}`;
    }
    return baseClass;
  };

  // Determine flow direction for arrow animation
  const isFlowingRight = 
    (step.source === 'CLIENT' && step.target === 'SERVER') ||
    (step.source === 'SERVER' && step.target === 'DATABASE');
  
  const isFlowingLeft = 
    (step.source === 'DATABASE' && step.target === 'SERVER') ||
    (step.source === 'SERVER' && step.target === 'CLIENT');

  // Internal Server Highlights
  const isSpringActive = step.source === 'SERVER' || step.target === 'SERVER';
  const activeComp = step.activeComponent;

  return (
    <div className="w-full h-80 bg-slate-950 rounded-2xl border border-slate-800 p-8 flex items-center justify-between relative overflow-hidden">
      
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      {/* --- CLIENT NODE --- */}
      <div className={getEntityStyle('CLIENT')}>
        <div className="bg-emerald-500/20 p-3 rounded-full mb-2">
          <Monitor className="w-8 h-8 text-emerald-400" />
        </div>
        <span className="font-bold text-emerald-100">Vue 3 Client</span>
        <span className="text-xs text-emerald-400 mt-1">Axios / Pinia</span>
        
        {/* Client Sub-components */}
        <div className="absolute -bottom-16 flex gap-2">
           <span className={`text-[10px] px-2 py-1 rounded border ${activeComp === 'storage' ? 'bg-emerald-600 border-emerald-400 text-white' : 'border-slate-700 text-slate-500'}`}>
             Storage
           </span>
           <span className={`text-[10px] px-2 py-1 rounded border ${activeComp === 'render' ? 'bg-emerald-600 border-emerald-400 text-white' : 'border-slate-700 text-slate-500'}`}>
             DOM
           </span>
        </div>
      </div>

      {/* CONNECTION 1: Client <-> Server */}
      <div className="flex-1 h-2 bg-slate-800 mx-4 relative rounded-full">
         {/* Packet Animation */}
         {(step.source === 'CLIENT' && step.target === 'SERVER') && (
           <div className="absolute top-1/2 left-0 -translate-y-1/2 w-4 h-4 bg-emerald-400 rounded-full shadow-[0_0_10px_#34d399] animate-[slideRight_1s_ease-in-out_infinite]"></div>
         )}
         {(step.source === 'SERVER' && step.target === 'CLIENT') && (
           <div className="absolute top-1/2 right-0 -translate-y-1/2 w-4 h-4 bg-indigo-400 rounded-full shadow-[0_0_10px_#818cf8] animate-[slideLeft_1s_ease-in-out_infinite]"></div>
         )}
      </div>

      {/* --- SERVER NODE --- */}
      <div className={getEntityStyle('SERVER')}>
        <div className="bg-indigo-500/20 p-3 rounded-full mb-2">
          <Server className="w-8 h-8 text-indigo-400" />
        </div>
        <span className="font-bold text-indigo-100">Spring Boot</span>
        <span className="text-xs text-indigo-400 mt-1">Tomcat:8080</span>

        {/* Server Internal Layers Visualization */}
        {isSpringActive && (
          <div className="absolute -top-6 -right-12 flex flex-col gap-1 bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-xl z-10 scale-90">
             <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${activeComp === 'filter' || activeComp === 'jwt' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
               <ShieldCheck size={12} /> Security Filter
             </div>
             <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${activeComp === 'controller' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
               <LayoutList size={12} /> Controller
             </div>
             <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${activeComp === 'mapper' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
               <FileJson size={12} /> Service / MyBatis
             </div>
          </div>
        )}
      </div>

      {/* CONNECTION 2: Server <-> DB */}
      <div className="flex-1 h-2 bg-slate-800 mx-4 relative rounded-full">
        {(step.source === 'SERVER' && step.target === 'DATABASE') && (
           <div className="absolute top-1/2 left-0 -translate-y-1/2 w-4 h-4 bg-indigo-400 rounded-full shadow-[0_0_10px_#818cf8] animate-[slideRight_1s_ease-in-out_infinite]"></div>
         )}
         {(step.source === 'DATABASE' && step.target === 'SERVER') && (
           <div className="absolute top-1/2 right-0 -translate-y-1/2 w-4 h-4 bg-amber-400 rounded-full shadow-[0_0_10px_#fbbf24] animate-[slideLeft_1s_ease-in-out_infinite]"></div>
         )}
      </div>

      {/* --- DATABASE NODE --- */}
      <div className={getEntityStyle('DATABASE')}>
        <div className="bg-amber-500/20 p-3 rounded-full mb-2">
          <Database className="w-8 h-8 text-amber-400" />
        </div>
        <span className="font-bold text-amber-100">MySQL</span>
        <span className="text-xs text-amber-400 mt-1">Port: 3306</span>
      </div>

      <style>{`
        @keyframes slideRight {
          0% { left: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        @keyframes slideLeft {
          0% { right: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { right: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default SimulationDiagram;