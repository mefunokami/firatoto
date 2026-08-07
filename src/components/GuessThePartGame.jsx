import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Trophy, Sparkles, ArrowRight, XCircle, CheckCircle } from 'lucide-react';

const allParts = [
  { id: 1, name: 'Fren Diski', image: '/brake_disc.jpg', options: ['Amortisör', 'Fren Diski', 'Debriyaj Balatası', 'Volan'] },
  { id: 2, name: 'Akü', image: '/part_battery.jpg', options: ['Radyatör', 'Motor Beyni', 'Akü', 'Sigorta Kutusu'] },
  { id: 3, name: 'Buji', image: '/part_spark_plug.jpg', options: ['Buji', 'Enjektör', 'Subap', 'Eksantrik Mili'] },
  { id: 4, name: 'Amortisör', image: '/part_shock.jpg', options: ['Krank Mili', 'Amortisör', 'Aks Kafası', 'Salıncak'] },
  { id: 5, name: 'Hava Filtresi', image: '/part_filter.jpg', options: ['Polen Filtresi', 'Yağ Filtresi', 'Hava Filtresi', 'Yakıt Filtresi'] },
  { id: 6, name: 'Piston', image: '/part_piston.jpg', options: ['Piston', 'Sekman', 'Krank Mili', 'Subap Fincanı'] },
  { id: 7, name: 'Radyatör', image: '/part_radiator.jpg', options: ['Klima Kompresörü', 'İntercooler', 'Radyatör', 'Katalizör'] },
  { id: 8, name: 'Alternatör', image: '/part_alternator.jpg', options: ['Marş Motoru', 'Alternatör (Şarj Dinamosu)', 'Devirdaim Pompası', 'Direksiyon Pompası'] },
  { id: 9, name: 'Far', image: '/part_headlight.jpg', options: ['Stop Lambası', 'Sis Farı', 'Sinyal Kolu', 'Far'] },
  { id: 10, name: 'Silecek', image: '/part_wiper.jpg', options: ['Silecek Motoru', 'Cam Krikosu', 'Silecek', 'Fitil'] },
];

export default function GuessThePartGame() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guessed, setGuessed] = useState(false);
  const [won, setWon] = useState(false);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  useEffect(() => {
    // Oyun başladığında soruları karıştır ve hazırla
    const shuffled = [...allParts].sort(() => 0.5 - Math.random());
    setQuestions(shuffled);
  }, []);

  if (questions.length === 0) return null;

  const currentPart = questions[currentIndex];

  const handleGuess = (opt) => {
    if (guessed) return;
    setGuessed(true);
    if (opt === currentPart.name) {
      setWon(true);
      setScore(s => s + 1);
    } else {
      setWon(false);
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(c => c + 1);
      setGuessed(false);
      setWon(false);
    } else {
      setGameFinished(true);
    }
  };

  const restartGame = () => {
    const shuffled = [...allParts].sort(() => 0.5 - Math.random());
    setQuestions(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setGuessed(false);
    setWon(false);
    setGameFinished(false);
  };

  return (
    <div className="bg-white dark:bg-card rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-border overflow-hidden h-full flex flex-col relative group">
      {/* Üst Kısım (Sarı Tema) */}
      <div className="bg-[#ffc107] p-2 text-gray-900 dark:text-foreground flex items-center justify-between shrink-0 relative overflow-hidden px-4">
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-white/20 rounded-full blur-xl group-hover:bg-white/40 dark:bg-card/40 transition-all"></div>
        <div className="flex items-center gap-1.5 font-black tracking-tight z-10 text-xs">
          <HelpCircle className="w-4 h-4" />
          <span>BU HANGİ PARÇA?</span>
        </div>
        {!gameFinished && (
          <div className="text-[10px] font-bold bg-yellow-400 px-2 py-0.5 rounded-full">
            {currentIndex + 1} / {questions.length}
          </div>
        )}
      </div>

      {/* Oyun Alanı */}
      <div className="flex-1 p-2 flex flex-col sm:flex-row items-center justify-center gap-3 relative bg-gray-50/50">
        
        {gameFinished ? (
          <div className="flex flex-col items-center justify-center text-center w-full py-2">
            <Trophy className="w-10 h-10 text-yellow-500 mb-2" />
            <h3 className="font-extrabold text-gray-900 dark:text-foreground text-sm mb-1">Oyun Bitti!</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Skorun: <span className="font-bold text-green-600">{score} / {questions.length}</span></p>
            {score >= 7 ? (
              <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 text-[10px] font-bold py-1 px-3 rounded flex items-center gap-1 mb-2">
                <Sparkles className="w-3 h-3 text-yellow-600" />
                Ödül Kazandın! Kod: USTA5
              </div>
            ) : (
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">Arabaları biraz daha tanıman lazım!</p>
            )}
            <button onClick={restartGame} className="text-yellow-700 font-bold text-[10px] bg-yellow-50 px-3 py-1.5 rounded-md border border-yellow-300 hover:bg-yellow-100 transition-colors">Yeniden Oyna</button>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 relative rounded-xl overflow-hidden border-2 border-gray-200 dark:border-border/50 shadow-sm bg-white flex items-center justify-center p-1">
              <img 
                key={currentPart.image}
                src={currentPart.image} 
                alt="Oto Parça" 
                className="w-full h-full object-contain transition-all duration-300" 
              />
            </div>

            <div className="flex-1 min-w-0 w-full">
              <AnimatePresence mode="wait">
                {!guessed ? (
                  <motion.div 
                    key={`options-${currentIndex}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full grid grid-cols-2 gap-1.5"
                  >
                    {currentPart.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleGuess(opt)}
                        className="bg-white dark:bg-card hover:bg-yellow-50 hover:text-yellow-700 border border-gray-200 dark:border-border hover:border-yellow-400 text-gray-700 dark:text-gray-300 text-[9px] sm:text-[10px] font-bold py-2 px-1 rounded-md transition-all shadow-sm hover:shadow truncate"
                        title={opt}
                      >
                        {opt}
                      </button>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    key={`result-${currentIndex}`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center text-center w-full justify-center h-full"
                  >
                    {won ? (
                      <div className="flex flex-col items-center gap-0.5 text-green-600 mb-2">
                        <CheckCircle className="w-6 h-6 mb-1" />
                        <h3 className="font-extrabold text-xs">Doğru Bildin!</h3>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-0.5 text-red-500 mb-1">
                        <XCircle className="w-5 h-5 mb-0.5" />
                        <h3 className="font-bold text-[11px]">Yanlış!</h3>
                        <p className="text-[9px] text-gray-500 dark:text-gray-400">Cevap: <span className="font-bold text-gray-800 dark:text-gray-200">{currentPart.name}</span></p>
                      </div>
                    )}
                    
                    <button 
                      onClick={nextQuestion} 
                      className="mt-1 flex items-center justify-center gap-1 text-white bg-gray-900 hover:bg-gray-800 font-bold text-[10px] px-3 py-1.5 rounded-md transition-colors w-full"
                    >
                      Sıradaki Soru <ArrowRight className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
