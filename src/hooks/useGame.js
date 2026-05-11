import { useState, useCallback, useRef, useEffect } from 'react';
import { WORDS, DEFAULT_TIMER_MINUTES } from '../utils/constants';
import { shuffleArray } from '../utils/helpers';

const STORAGE_KEY = 'spy_game_state';

function saveState(state) {
  try {
    const serializable = {
      screen: state.screen,
      playerCount: state.playerCount,
      players: state.players,
      spyCount: state.spyCount,
      timerDuration: state.timerDuration,
      spyIndices: state.spyIndices,
      secretWord: state.secretWord,
      timeLeft: state.timeLeft,
      currentRevealIndex: state.currentRevealIndex,
      selectedVote: state.selectedVote,
      selectedWord: state.selectedWord,
      context: state.context,
      result: state.result,
      timerRunning: !!state.timerRef.current,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch (e) {
    // storage full or unavailable
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Only restore if saved within last 2 hours
      if (Date.now() - parsed.timestamp < 2 * 60 * 60 * 1000) {
        return parsed;
      }
    }
  } catch (e) {
    // invalid JSON
  }
  return null;
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
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
  const [currentRevealIndex, setCurrentRevealIndex] = useState(saved?.currentRevealIndex || 0);
  const [selectedVote, setSelectedVote] = useState(saved?.selectedVote || -1);
  const [selectedWord, setSelectedWord] = useState(saved?.selectedWord || '');
  const [context, setContext] = useState(saved?.context || '');
  const [result, setResult] = useState(saved?.result || null);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const startValueRef = useRef(saved?.timeLeft || timerDuration * 60);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Save state on every meaningful change
  useEffect(() => {
    saveState({
      screen,
      playerCount,
      players,
      spyCount,
      timerDuration,
      spyIndices,
      secretWord,
      timeLeft,
      currentRevealIndex,
      selectedVote,
      selectedWord,
      context,
      result,
      timerRef,
    });
  }, [screen, playerCount, players, spyCount, timerDuration, spyIndices, secretWord, timeLeft, currentRevealIndex, selectedVote, selectedWord, context, result]);

  // Resume timer if restoring from playing state
  useEffect(() => {
    if (screen === 'playing' && saved?.timerRunning) {
      startTimer();
    }
  }, []);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const startTimer = useCallback(() => {
    stopTimer();
    startTimeRef.current = Date.now();
    startValueRef.current = timeLeft;

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const newTime = Math.max(0, startValueRef.current - elapsed);
      setTimeLeft(newTime);

      if (newTime <= 0) {
        stopTimer();
        setContext('timeout');
        setScreen('spy-guess');
      }
    }, 250);
  }, [timeLeft, stopTimer]);

  const initGame = useCallback((finalNames) => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    const indices = shuffleArray(Array.from({ length: finalNames.length }, (_, i) => i));
    const spies = indices.slice(0, spyCount);

    setPlayers(finalNames);
    setSecretWord(word);
    setSpyIndices(spies);
    setCurrentRevealIndex(0);
    setTimeLeft(timerDuration * 60);
    setSelectedVote(-1);
    setSelectedWord('');
    setContext('');
    setResult(null);
    setScreen('reveal-pass');
  }, [spyCount, timerDuration]);

  const handleVoteConfirm = useCallback(() => {
    if (spyIndices.includes(selectedVote)) {
      setContext('caught');
      setScreen('spy-guess');
    } else {
      setResult({
        winner: 'locals',
        message: `${players[selectedVote]} جاسوس نبود!`
      });
      setScreen('result');
    }
    stopTimer();
  }, [selectedVote, spyIndices, players, stopTimer]);

  const handleSpyGuess = useCallback((word) => {
    stopTimer();
    if (word === secretWord) {
      setResult({
        winner: 'spy',
        message: 'جاسوس کلمه مخفی را درست حدس زد!'
      });
    } else {
      setResult({
        winner: 'locals',
        message: 'جاسوس کلمه مخفی را اشتباه حدس زد!'
      });
    }
    setScreen('result');
  }, [secretWord, stopTimer]);

  const handleRevealNext = useCallback(() => {
    const nextIndex = currentRevealIndex + 1;
    if (nextIndex < playerCount) {
      setCurrentRevealIndex(nextIndex);
      setScreen('reveal-pass');
    } else {
      setScreen('playing');
      startTimer();
    }
  }, [currentRevealIndex, playerCount, startTimer]);

  const resetToHome = useCallback(() => {
    stopTimer();
    clearState();
    setScreen('home');
    setPlayerCount(4);
    setPlayers([]);
    setSpyCount(1);
    setTimerDuration(DEFAULT_TIMER_MINUTES);
    setSpyIndices([]);
    setSecretWord('');
    setTimeLeft(DEFAULT_TIMER_MINUTES * 60);
    setCurrentRevealIndex(0);
    setSelectedVote(-1);
    setSelectedWord('');
    setContext('');
    setResult(null);
  }, [stopTimer]);

  return {
    screen, setScreen,
    playerCount, setPlayerCount,
    players, setPlayers,
    spyCount, setSpyCount,
    timerDuration, setTimerDuration,
    spyIndices,
    secretWord,
    timeLeft,
    currentRevealIndex,
    selectedVote, setSelectedVote,
    selectedWord, setSelectedWord,
    context, setContext,
    result,
    initGame,
    startTimer,
    stopTimer,
    handleVoteConfirm,
    handleSpyGuess,
    handleRevealNext,
    resetToHome,
  };
}