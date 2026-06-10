import { useState, useCallback, useRef, useEffect } from 'react';
import { WORDS, DEFAULT_TIMER_MINUTES } from '../utils/constants';
import { shuffleArray } from '../utils/helpers';

const STORAGE_KEY = 'spy_game_state';

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function loadState() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function useGame() {
  const saved = loadState();

  const [screen, setScreen] = useState(saved?.screen || 'home');
  const [playerCount, setPlayerCount] = useState(saved?.playerCount || 4);
  const [players, setPlayers] = useState(saved?.players || []);
  const [spyCount, setSpyCount] = useState(saved?.spyCount || 1);
  const [timerDuration, setTimerDuration] = useState(saved?.timerDuration || DEFAULT_TIMER_MINUTES);

  const [spyIndices, setSpyIndices] = useState(saved?.spyIndices || []);
  const [secretWord, setSecretWord] = useState(saved?.secretWord || '');

  const [timeLeft, setTimeLeft] = useState(saved?.timeLeft || timerDuration * 60);

  const [currentRevealIndex, setCurrentRevealIndex] = useState(0);
  const [selectedVote, setSelectedVote] = useState(-1);
  const [selectedWord, setSelectedWord] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState(null);

  const timerRef = useRef(null);
  const startRef = useRef(0);
  const baseRef = useRef(0);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    startRef.current = Date.now();
    baseRef.current = timeLeft;

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      const next = Math.max(0, baseRef.current - elapsed);

      setTimeLeft(next);

      if (next <= 0) {
        stopTimer();
        setContext('timeout');
        setScreen('spy-guess');
      }
    }, 250);
  }, [timeLeft, stopTimer]);

  // SAVE SAFE STATE (FIXED)
  useEffect(() => {
    saveState({
      screen,
      playerCount,
      players,
      spyCount,
      timerDuration,
      spyIndices,
      secretWord,
      timeLeft
    });
  }, [screen, playerCount, players, spyCount, timerDuration, spyIndices, secretWord, timeLeft]);

  const initGame = useCallback((names) => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];

    const shuffled = shuffleArray([...Array(names.length).keys()]);
    const spies = shuffled.slice(0, spyCount);

    setPlayers(names);
    setSpyIndices(spies);
    setSecretWord(word);

    setCurrentRevealIndex(0);
    setSelectedVote(-1);
    setSelectedWord('');
    setResult(null);

    setTimeLeft(timerDuration * 60);

    setScreen('reveal-pass');
  }, [spyCount, timerDuration]);

  const handleRevealNext = useCallback(() => {
    if (currentRevealIndex + 1 < players.length) {
      setCurrentRevealIndex(v => v + 1);
      setScreen('reveal-pass');
    } else {
      setScreen('playing');
      startTimer();
    }
  }, [currentRevealIndex, players.length, startTimer]);

  const handleVoteConfirm = useCallback(() => {
    const isSpy = spyIndices.includes(selectedVote);

    if (isSpy) {
      setContext('caught');
      setScreen('spy-guess');
    } else {
      setResult({
        winner: 'locals',
        message: `${players[selectedVote]} جاسوس نبود`
      });
      setScreen('result');
    }

    stopTimer();
  }, [selectedVote, spyIndices, players, stopTimer]);

  const handleSpyGuess = useCallback((word) => {
    stopTimer();

    const win = word === secretWord;

    setResult({
      winner: win ? 'spy' : 'locals',
      message: win ? 'جاسوس درست حدس زد' : 'جاسوس اشتباه کرد'
    });

    setScreen('result');
  }, [secretWord, stopTimer]);

  const resetToHome = useCallback(() => {
    stopTimer();
    clearState();

    setScreen('home');
    setPlayers([]);
    setSpyIndices([]);
    setSelectedVote(-1);
    setSelectedWord('');
    setResult(null);
  }, [stopTimer]);

  return {
    screen,
    setScreen,

    playerCount,
    setPlayerCount,

    players,
    spyCount,
    setSpyCount,

    timerDuration,
    setTimerDuration,

    spyIndices,
    secretWord,
    timeLeft,

    currentRevealIndex,
    selectedVote,
    setSelectedVote,

    selectedWord,
    setSelectedWord,

    context,
    setContext,

    result,

    initGame,
    startTimer,
    stopTimer,
    handleRevealNext,
    handleVoteConfirm,
    handleSpyGuess,
    resetToHome
  };
}