import React from 'react';
import { useGame } from './hooks/useGame';
import HomeScreen from './components/HomeScreen';
import SetupScreen from './components/SetupScreen';
import RevealPassScreen from './components/RevealPassScreen';
import RevealCardScreen from './components/RevealCardScreen';
import GameScreen from './components/GameScreen';
import VotingScreen from './components/VotingScreen';
import SpyGuessScreen from './components/SpyGuessScreen';
import ResultScreen from './components/ResultScreen';

export default function App() {
  const game = useGame();

  const handleSetupStart = (finalNames) => {
    game.initGame(finalNames);
  };

  return (
    <div className="h-full w-full relative overflow-hidden bg-white">
      {game.screen === 'home' && (
        <HomeScreen onStart={() => game.setScreen('setup')} />
      )}
      
      {game.screen === 'setup' && (
        <SetupScreen
          playerCount={game.playerCount}
          setPlayerCount={game.setPlayerCount}
          players={game.players}
          spyCount={game.spyCount}
          setSpyCount={game.setSpyCount}
          timerDuration={game.timerDuration}
          setTimerDuration={game.setTimerDuration}
          onStart={handleSetupStart}
          onBack={() => {
            game.setPlayerCount(4);
            game.setPlayers([]);
            game.setSpyCount(1);
            game.setTimerDuration(10);
            game.setScreen('home');
          }}
        />
      )}
      
      {game.screen === 'reveal-pass' && (
        <RevealPassScreen
          playerName={game.players[game.currentRevealIndex]}
          currentNum={game.currentRevealIndex + 1}
          totalNum={game.playerCount}
          onNext={() => game.setScreen('reveal-card')}
        />
      )}
      
      {game.screen === 'reveal-card' && (
        <RevealCardScreen
          playerName={game.players[game.currentRevealIndex]}
          isSpy={game.spyIndices.includes(game.currentRevealIndex)}
          secretWord={game.secretWord}
          onNext={game.handleRevealNext}
        />
      )}
      
      {game.screen === 'playing' && (
        <GameScreen
          players={game.players}
          timeLeft={game.timeLeft}
          onVote={() => game.setScreen('voting')}
          onSpyReveal={() => {
            game.stopTimer();
            game.setContext('reveal');
            game.setScreen('spy-guess');
          }}
        />
      )}
      
      {game.screen === 'voting' && (
        <VotingScreen
          players={game.players}
          selectedVote={game.selectedVote}
          onVoteSelect={game.setSelectedVote}
          onConfirm={game.handleVoteConfirm}
          onBack={() => game.setScreen('playing')}
        />
      )}
      
      {game.screen === 'spy-guess' && (
        <SpyGuessScreen
          spyNames={game.spyIndices.map(i => game.players[i])}
          context={game.context}
          selectedWord={game.selectedWord}
          onWordSelect={game.setSelectedWord}
          onGuess={game.handleSpyGuess}
        />
      )}
      
      {game.screen === 'result' && game.result && (
        <ResultScreen
          result={game.result}
          spyNames={game.spyIndices.map(i => game.players[i])}
          secretWord={game.secretWord}
          onNewGame={() => game.setScreen('setup')}
          onHome={game.resetToHome}
        />
      )}
    </div>
  );
}