
import React, { useState, useEffect, useCallback } from 'react';
import { GameStage, Car, NPC, BattleTurn } from './types';
import { CARS, NPCS } from './constants';
import { generateBattleTurn } from './geminiService';

// --- Sub-components ---

const Header = () => (
  <header className="fixed top-0 w-full p-4 flex justify-between items-center z-50 bg-red-800/80 backdrop-blur-sm border-b border-yellow-600">
    <div className="flex items-center gap-2">
      <div className="bg-yellow-400 text-red-800 font-bold px-2 py-1 rounded italic">懂车帝</div>
      <span className="text-yellow-400 font-festive text-xl">二手车年终大促</span>
    </div>
    <div className="text-yellow-100 text-sm">《过年吃席模拟器》</div>
  </header>
);

const ProgressBar = ({ value }: { value: number }) => (
  <div className="w-full bg-red-950 h-6 rounded-full border-2 border-yellow-500 overflow-hidden relative shadow-inner">
    <div 
      className="h-full bg-gradient-to-r from-yellow-600 to-yellow-300 transition-all duration-500"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
    <div className="absolute inset-0 flex justify-center items-center text-xs font-bold text-red-900 uppercase">
      排面值: {value}%
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [stage, setStage] = useState<GameStage>(GameStage.HOME);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [faceValue, setFaceValue] = useState(0);
  const [currentTurn, setCurrentTurn] = useState<BattleTurn | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messageLog, setMessageLog] = useState<{ text: string, type: 'npc' | 'player' }[]>([]);
  const [npcIndex, setNpcIndex] = useState(0);

  const startGame = () => setStage(GameStage.CAR_SELECTION);

  const selectCar = (car: Car) => {
    setSelectedCar(car);
    setFaceValue(car.initialFace);
    setStage(GameStage.BATTLE);
    loadNextTurn(car, 0, car.initialFace);
  };

  const loadNextTurn = async (car: Car, nIdx: number, fVal: number) => {
    setIsLoading(true);
    const npc = NPCS[nIdx % NPCS.length];
    const turn = await generateBattleTurn(car, npc, fVal);
    setCurrentTurn({ ...turn, npc });
    setIsLoading(false);
  };

  const handleOptionSelect = (option: any) => {
    if (!currentTurn) return;
    
    const newFaceValue = Math.min(100, faceValue + option.faceChange);
    setFaceValue(newFaceValue);
    
    const newLog = [
      ...messageLog,
      { text: currentTurn.attack, type: 'npc' as const },
      { text: option.text, type: 'player' as const },
      { text: option.feedback, type: 'npc' as const }
    ];
    setMessageLog(newLog.slice(-6));

    if (newFaceValue >= 100) {
      setStage(GameStage.VICTORY);
    } else {
      const nextIdx = npcIndex + 1;
      setNpcIndex(nextIdx);
      loadNextTurn(selectedCar!, nextIdx, newFaceValue);
    }
  };

  return (
    <div className="min-h-screen bg-red-700 text-yellow-100 flex flex-col relative overflow-hidden">
      <Header />

      {/* Background Decor */}
      <div className="absolute top-20 left-10 opacity-20 text-6xl rotate-12">🧧</div>
      <div className="absolute bottom-20 right-10 opacity-20 text-6xl -rotate-12">🏮</div>
      <div className="absolute top-1/2 right-1/4 opacity-10 text-9xl font-festive">福</div>

      <main className="flex-1 flex flex-col items-center justify-center p-6 pt-24 pb-12">
        
        {stage === GameStage.HOME && (
          <div className="text-center space-y-8 animate-in fade-in zoom-in duration-700">
            <h1 className="text-5xl md:text-7xl font-festive text-yellow-400 drop-shadow-lg leading-tight">
              过年吃席模拟器
            </h1>
            <p className="text-xl md:text-2xl text-yellow-200 max-w-md mx-auto">
              如果你开的车不够有排面，<br/>
              年夜饭你敢先动筷子吗？
            </p>
            <div className="relative inline-block group">
              <button 
                onClick={startGame}
                className="bg-yellow-500 hover:bg-yellow-400 text-red-900 font-bold py-4 px-12 rounded-full text-2xl shadow-xl transform transition hover:scale-105 active:scale-95"
              >
                开始挑战
              </button>
              <div className="absolute -top-4 -right-4 bg-red-600 text-white text-xs px-2 py-1 rounded-md rotate-12 border border-yellow-400">
                懂车帝特供
              </div>
            </div>
          </div>
        )}

        {stage === GameStage.CAR_SELECTION && (
          <div className="w-full max-w-4xl space-y-8 animate-in slide-in-from-bottom duration-500">
            <h2 className="text-3xl font-festive text-center text-yellow-400">选择你的“回乡战车”</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CARS.map(car => (
                <div 
                  key={car.id}
                  onClick={() => selectCar(car)}
                  className="bg-red-800 border-2 border-yellow-600 rounded-2xl overflow-hidden cursor-pointer transform transition hover:-translate-y-2 hover:shadow-2xl group"
                >
                  <img src={car.image} alt={car.name} className="w-full h-40 object-cover grayscale group-hover:grayscale-0 transition" />
                  <div className="p-4 space-y-2">
                    <span className="bg-yellow-500 text-red-900 text-xs font-bold px-2 py-1 rounded">{car.tag}</span>
                    <h3 className="text-xl font-bold text-yellow-100">{car.name}</h3>
                    <p className="text-sm text-yellow-200/70">{car.description}</p>
                    <div className="pt-2 flex justify-between items-center">
                      <span className="text-xs">初始排面:</span>
                      <span className="text-yellow-400 font-bold">{car.initialFace}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stage === GameStage.BATTLE && selectedCar && (
          <div className="w-full max-w-2xl h-full flex flex-col gap-6">
            {/* Status Bar */}
            <ProgressBar value={faceValue} />

            {/* The Table Scene (Conceptual 1st Person) */}
            <div className="relative flex-1 min-h-[300px] flex items-center justify-center">
              {/* NPC Positioning */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-8 border-yellow-700 bg-red-900 flex items-center justify-center shadow-2xl relative">
                  <span className="text-4xl md:text-6xl animate-bounce-slow">🍲</span>
                  <div className="absolute inset-0 rounded-full border-4 border-yellow-500/20 animate-ping" />
                </div>
              </div>

              {/* NPCs */}
              {NPCS.map((npc, idx) => {
                const isActive = currentTurn?.npc.id === npc.id;
                const posClasses = {
                  left: 'left-0 top-1/2 -translate-y-1/2',
                  top: 'top-0 left-1/2 -translate-x-1/2',
                  right: 'right-0 top-1/2 -translate-y-1/2'
                }[npc.position];

                return (
                  <div key={npc.id} className={`absolute ${posClasses} transition-all duration-500 flex flex-col items-center ${isActive ? 'scale-125 z-20' : 'scale-90 opacity-60'}`}>
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-4 ${isActive ? 'border-yellow-400 bg-yellow-900' : 'border-red-900 bg-red-950'} flex items-center justify-center text-4xl shadow-lg`}>
                      {npc.avatar}
                    </div>
                    <span className="text-sm font-bold mt-2 bg-red-900/80 px-2 rounded border border-yellow-600/50">{npc.name}</span>
                    
                    {isActive && currentTurn && !isLoading && (
                      <div className="absolute top-[-80px] w-48 bg-white text-gray-800 p-3 rounded-xl shadow-2xl border-2 border-yellow-500 animate-in zoom-in slide-in-from-bottom duration-300">
                        <p className="text-sm font-medium leading-tight">{currentTurn.attack}</p>
                        <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Area */}
            <div className="bg-red-900/50 backdrop-blur-md p-4 rounded-2xl border-2 border-yellow-600/30 space-y-4">
              {isLoading ? (
                <div className="h-40 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-yellow-400 font-festive text-xl">亲戚们正在酝酿攻击...</p>
                </div>
              ) : currentTurn ? (
                <div className="grid grid-cols-1 gap-3">
                  {currentTurn.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleOptionSelect(option)}
                      className="bg-gradient-to-r from-red-800 to-red-900 hover:from-yellow-600 hover:to-yellow-500 hover:text-red-900 text-yellow-100 p-4 rounded-xl text-left border border-yellow-600/50 transition group flex justify-between items-center"
                    >
                      <span className="flex-1 font-medium">{option.text}</span>
                      <span className={`text-xs ml-4 px-2 py-1 rounded ${option.faceChange > 0 ? 'bg-green-600' : 'bg-red-600'}`}>
                        {option.faceChange >= 0 ? `+${option.faceChange}` : option.faceChange} 排面
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Log */}
            <div className="h-24 overflow-y-auto bg-black/20 p-2 rounded text-xs space-y-1">
              {messageLog.map((log, i) => (
                <div key={i} className={`${log.type === 'npc' ? 'text-yellow-400' : 'text-yellow-100 text-right'}`}>
                  {log.type === 'npc' ? '💬' : '🗣️'} {log.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {stage === GameStage.VICTORY && (
          <div className="text-center space-y-8 animate-in zoom-in duration-500">
            <div className="text-9xl mb-4">🥢🥘</div>
            <h2 className="text-6xl font-festive text-yellow-400">排面拉满，准许动筷！</h2>
            <p className="text-2xl text-yellow-100">
              全桌亲戚都看呆了：<br/>
              “这孩子，开这车回来，肯定在大城市混得好！”
            </p>
            <div className="bg-yellow-900/50 p-6 rounded-2xl border-2 border-yellow-500 max-w-sm mx-auto">
              <h3 className="text-xl font-bold mb-2">懂车帝年终锦囊</h3>
              <p className="text-sm">
                想要同款排面？懂车帝二手车年终大促，<br/>
                深度检测，拒绝事故车，好车不贵，<br/>
                让你回家过年最有面子！
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-yellow-500 text-red-900 font-bold py-3 px-10 rounded-full text-xl hover:scale-105 transition"
            >
              再显摆一次
            </button>
          </div>
        )}

      </main>

      {/* Footer Branding */}
      <footer className="fixed bottom-0 w-full p-2 bg-black/30 backdrop-blur-sm text-center text-[10px] text-yellow-600/50 tracking-widest">
        DONGCHEDI SECOND-HAND CAR - YEAR END FESTIVAL 2025
      </footer>
    </div>
  );
}
