import React, { useState, useMemo } from 'react';
import DenisRibbonHeader from './components/DenisRibbonHeader';
import StreetGameMap from './components/StreetGameMap';
import RoundHUD from './components/RoundHUD';
import RoundResultModal from './components/RoundResultModal';
import GameOverScreen from './components/GameOverScreen';
import StartScreen from './components/StartScreen';
import LeaderboardModal from './components/LeaderboardModal';
import HelpModal from './components/HelpModal';

import landmarksData from './data/landmarks.json';
import ranksData from './data/ranks.json';
import { getRandomStreetRound, getRankForScore } from './utils/streetRandomizer';
import { calculateDistanceToStreet, calculateScore } from './utils/geoUtils';

const TOTAL_ROUNDS = 5;

export default function App() {
  const [gameState, setGameState] = useState('start'); // 'start' | 'playing' | 'round_result' | 'game_over'
  const [selectedZoneId, setSelectedZoneId] = useState('centro');
  const [roundStreets, setRoundStreets] = useState([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [userPin, setUserPin] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [lastRoundResult, setLastRoundResult] = useState(null);
  const [roundHistory, setRoundHistory] = useState([]);

  // Modals
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Active Zone metadata
  const currentZone = useMemo(() => {
    return landmarksData.find(z => z.id === selectedZoneId) || landmarksData[0];
  }, [selectedZoneId]);

  // Current street to find
  const currentStreet = roundStreets[currentRoundIndex] || null;

  // Start new game
  const handleStartGame = (zoneId) => {
    setSelectedZoneId(zoneId);
    const streets = getRandomStreetRound({
      zoneId,
      count: TOTAL_ROUNDS
    });
    setRoundStreets(streets);
    setCurrentRoundIndex(0);
    setUserPin(null);
    setTotalScore(0);
    setRoundHistory([]);
    setLastRoundResult(null);
    setGameState('playing');
  };

  // Drop / Move pin
  const handlePinChange = (coords) => {
    setUserPin(coords);
  };

  // Confirm user's guess
  const handleConfirmGuess = () => {
    if (!userPin || !currentStreet) return;

    const { distance, closestPoint } = calculateDistanceToStreet(userPin, currentStreet);
    const pointsEarned = calculateScore(distance);

    const result = {
      street: currentStreet,
      distance,
      points: pointsEarned,
      closestPoint
    };

    setLastRoundResult(result);
    setTotalScore(prev => prev + pointsEarned);
    setRoundHistory(prev => [...prev, result]);
    setGameState('round_result');
  };

  // Move to next round or finish
  const handleNextRound = () => {
    if (currentRoundIndex + 1 < TOTAL_ROUNDS) {
      setCurrentRoundIndex(prev => prev + 1);
      setUserPin(null);
      setLastRoundResult(null);
      setGameState('playing');
    } else {
      setGameState('game_over');
    }
  };

  // Save record to local storage
  const handleSaveScore = (playerName) => {
    const rank = getRankForScore(totalScore, ranksData);
    const newEntry = {
      name: playerName,
      score: totalScore,
      rankBadge: rank.badge,
      zone: currentZone.shortName,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      const stored = localStorage.getItem('cuanta_calle_leaderboard');
      const list = stored ? JSON.parse(stored) : [];
      list.push(newEntry);
      list.sort((a, b) => b.score - a.score);
      localStorage.setItem('cuanta_calle_leaderboard', JSON.stringify(list.slice(0, 20)));
    } catch (e) {
      console.error(e);
    }
  };

  const finalRank = useMemo(() => {
    return getRankForScore(totalScore, ranksData);
  }, [totalScore]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0B0F19] text-slate-100 overflow-hidden select-none">
      {/* 1. Mandatory Denis Gimenez Ribbon Header */}
      <DenisRibbonHeader
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        currentZoneName={gameState !== 'start' ? currentZone.shortName : null}
      />

      {/* 2. Main Map Canvas (Interactive without labels) */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <StreetGameMap
          userPin={userPin}
          onPinChange={handlePinChange}
          isRevealed={gameState === 'round_result'}
          currentStreet={currentStreet}
          closestPoint={lastRoundResult?.closestPoint}
          zoneCenter={currentZone.center}
          zoneZoom={currentZone.zoom}
        />

        {/* 3. Gameplay HUD (during guessing) */}
        {gameState === 'playing' && (
          <RoundHUD
            currentRound={currentRoundIndex + 1}
            totalRounds={TOTAL_ROUNDS}
            currentStreet={currentStreet}
            score={totalScore}
            userPin={userPin}
            onConfirmGuess={handleConfirmGuess}
          />
        )}

        {/* 4. Round Result Modal (reveal after guess) */}
        {gameState === 'round_result' && lastRoundResult && (
          <RoundResultModal
            currentRound={currentRoundIndex + 1}
            totalRounds={TOTAL_ROUNDS}
            street={currentStreet}
            distanceMeters={lastRoundResult.distance}
            pointsEarned={lastRoundResult.points}
            onNextRound={handleNextRound}
          />
        )}

        {/* 5. Start / Zone Selection Screen */}
        {gameState === 'start' && (
          <StartScreen
            onStartGame={handleStartGame}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onOpenHelp={() => setIsHelpOpen(true)}
          />
        )}

        {/* 6. Game Over / Victory Summary Screen */}
        {gameState === 'game_over' && (
          <GameOverScreen
            totalScore={totalScore}
            roundHistory={roundHistory}
            rank={finalRank}
            zoneName={currentZone.name}
            onPlayAgain={() => setGameState('start')}
            onSaveScore={handleSaveScore}
          />
        )}
      </main>

      {/* Auxiliary Modals */}
      {isLeaderboardOpen && (
        <LeaderboardModal onClose={() => setIsLeaderboardOpen(false)} />
      )}

      {isHelpOpen && (
        <HelpModal onClose={() => setIsHelpOpen(false)} />
      )}
    </div>
  );
}
