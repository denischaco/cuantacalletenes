import React, { useState, useMemo } from 'react';
import DenisRibbonHeader from './components/DenisRibbonHeader';
import StreetGameMap from './components/StreetGameMap';
import RoundHUD from './components/RoundHUD';
import RoundResultModal from './components/RoundResultModal';
import GameOverScreen from './components/GameOverScreen';
import StartScreen from './components/StartScreen';
import LeaderboardModal from './components/LeaderboardModal';
import HelpModal from './components/HelpModal';
import AdvertiseModal from './components/AdvertiseModal';

import landmarksData from './data/landmarks.json';
import ranksData from './data/ranks.json';
import streetsData from './data/resistenciaStreets.json';
import sponsorsData from './data/sponsors.json';
import { getRandomStreetRound, getRankForScore, generateRoundOptions } from './utils/streetRandomizer';
import { getRandomNonIntersectionPoint, validateStreetGuess } from './utils/geoUtils';
import { saveScoreEntry } from './services/firebase';
import {
  trackGameStart,
  trackOpenAdvertise,
  trackRoundAnswer,
  trackGameComplete
} from './services/analytics';

const TOTAL_ROUNDS = 5;

export default function App() {
  const [gameState, setGameState] = useState('start'); // 'start' | 'playing' | 'round_result' | 'game_over'
  const [selectedZoneId, setSelectedZoneId] = useState('centro');
  const [roundStreets, setRoundStreets] = useState([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [targetPoint, setTargetPoint] = useState(null);
  const [roundOptions, setRoundOptions] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [lastRoundResult, setLastRoundResult] = useState(null);
  const [roundHistory, setRoundHistory] = useState([]);

  // Modals
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isAdvertiseOpen, setIsAdvertiseOpen] = useState(false);

  // Active Zone metadata
  const currentZone = useMemo(() => {
    return landmarksData.find(z => z.id === selectedZoneId) || landmarksData[0];
  }, [selectedZoneId]);

  // Active Zone Sponsor (Sponsors with plan: 'sponsor_zona')
  const zoneSponsor = useMemo(() => {
    return (
      sponsorsData.find(
        (s) =>
          s.active !== false &&
          s.plan === 'sponsor_zona' &&
          (s.zoneId === selectedZoneId ||
            s.zoneId === 'all' ||
            selectedZoneId === 'toda_ciudad' ||
            !s.zoneId ||
            sponsorsData.filter((x) => x.active !== false && x.plan === 'sponsor_zona').length === 1)
      ) || null
    );
  }, [selectedZoneId]);

  // Current street to guess
  const currentStreet = roundStreets[currentRoundIndex] || null;

  // Open advertise modal with analytics source tracking
  const handleOpenAdvertise = (source = 'unknown') => {
    trackOpenAdvertise(source);
    setIsAdvertiseOpen(true);
  };

  // Start new game
  const handleStartGame = (zoneId) => {
    setSelectedZoneId(zoneId);
    const zone = landmarksData.find(z => z.id === zoneId) || landmarksData[0];
    trackGameStart(zoneId, zone.name);

    const streets = getRandomStreetRound({
      zoneId,
      count: TOTAL_ROUNDS
    });

    setRoundStreets(streets);
    setCurrentRoundIndex(0);
    setTotalScore(0);
    setRoundHistory([]);
    setLastRoundResult(null);

    // Prepare first round point & options
    if (streets.length > 0) {
      const firstStreet = streets[0];
      const pt = getRandomNonIntersectionPoint(firstStreet, streetsData, zone);
      const opts = generateRoundOptions(firstStreet, streetsData, 4);
      setTargetPoint(pt);
      setRoundOptions(opts);
    }

    setGameState('playing');
  };

  // Process user's guess (either write mode or multiple-choice mode)
  const handleSubmitGuess = ({ mode, guess, streetId }) => {
    if (!currentStreet) return;

    let isCorrect = false;
    let missedAccents = false;
    let isExactAddress = false;
    let scoreDelta = 0;

    if (mode === 'write') {
      const validation = validateStreetGuess(guess, currentStreet);
      isCorrect = validation.isCorrect;
      missedAccents = validation.missedAccents;
      isExactAddress = Boolean(currentStreet?.isSponsored && validation.isExactAddress);

      if (isCorrect) {
        scoreDelta = isExactAddress ? 4 : 2;
      } else {
        scoreDelta = totalScore > 0 ? -1 : 0;
      }
    } else {
      // Multiple Choice mode
      isCorrect = (streetId === currentStreet.id) || (guess === currentStreet.name) || (currentStreet.sponsor?.targetStreet?.id === streetId);

      if (isCorrect) {
        scoreDelta = 1;
      } else {
        scoreDelta = totalScore > 0 ? -1 : 0;
      }
    }

    const newScore = Math.max(0, totalScore + scoreDelta);

    trackRoundAnswer({
      roundNumber: currentRoundIndex + 1,
      mode,
      isCorrect,
      scoreDelta,
      streetName: currentStreet.name,
      isExactAddress
    });

    const result = {
      street: currentStreet,
      isCorrect,
      isExactAddress,
      scoreDelta,
      mode,
      userGuess: guess,
      missedAccents
    };

    setLastRoundResult(result);
    setTotalScore(newScore);
    setRoundHistory(prev => [...prev, result]);
    setGameState('round_result');
  };

  // Move to next round or finish
  const handleNextRound = () => {
    if (currentRoundIndex + 1 < TOTAL_ROUNDS) {
      const nextIdx = currentRoundIndex + 1;
      const nextStreet = roundStreets[nextIdx];
      const pt = getRandomNonIntersectionPoint(nextStreet, streetsData, currentZone);
      const opts = generateRoundOptions(nextStreet, streetsData, 4);

      setCurrentRoundIndex(nextIdx);
      setTargetPoint(pt);
      setRoundOptions(opts);
      setLastRoundResult(null);
      setGameState('playing');
    } else {
      const rank = getRankForScore(totalScore, ranksData);
      trackGameComplete({
        totalScore,
        rankTitle: rank.title,
        rankBadge: rank.badge,
        zoneName: currentZone.name
      });
      setGameState('game_over');
    }
  };

  // Save record to Firestore and local storage
  const handleSaveScore = (playerName) => {
    const rank = getRankForScore(totalScore, ranksData);
    saveScoreEntry({
      name: playerName,
      score: totalScore,
      rankBadge: rank.badge,
      zone: currentZone.shortName,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const finalRank = useMemo(() => {
    return getRankForScore(totalScore, ranksData);
  }, [totalScore]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0B0F19] text-slate-100 overflow-hidden select-none">
      {/* 1. Denis Ribbon Header */}
      <DenisRibbonHeader
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenAdvertise={() => handleOpenAdvertise('header')}
        currentZoneName={gameState !== 'start' ? currentZone.shortName : null}
      />

      {/* 2. Main Map Canvas (Interactive without labels) */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <StreetGameMap
          targetPoint={targetPoint}
          isRevealed={gameState === 'round_result'}
          currentStreet={currentStreet}
          zoneCenter={currentZone.center}
          zoneZoom={currentZone.zoom}
        />

        {/* 3. Gameplay HUD (Guessing input / options) */}
        {gameState === 'playing' && (
          <RoundHUD
            currentRound={currentRoundIndex + 1}
            totalRounds={TOTAL_ROUNDS}
            score={totalScore}
            options={roundOptions}
            onSubmitGuess={handleSubmitGuess}
            currentStreet={currentStreet}
          />
        )}

        {/* 4. Round Result Modal (reveal after guess) */}
        {gameState === 'round_result' && lastRoundResult && (
          <RoundResultModal
            currentRound={currentRoundIndex + 1}
            totalRounds={TOTAL_ROUNDS}
            street={currentStreet}
            result={lastRoundResult}
            onNextRound={handleNextRound}
          />
        )}

        {/* 5. Start / Zone Selection Screen */}
        {gameState === 'start' && (
          <StartScreen
            onStartGame={handleStartGame}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onOpenHelp={() => setIsHelpOpen(true)}
            onOpenAdvertise={() => handleOpenAdvertise('start_screen')}
          />
        )}

        {/* 6. Game Over / Victory Summary Screen */}
        {gameState === 'game_over' && (
          <GameOverScreen
            totalScore={totalScore}
            roundHistory={roundHistory}
            rank={finalRank}
            zoneName={currentZone.name}
            zoneSponsor={zoneSponsor}
            onPlayAgain={() => setGameState('start')}
            onSaveScore={handleSaveScore}
            onOpenAdvertise={() => handleOpenAdvertise('game_over')}
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

      {isAdvertiseOpen && (
        <AdvertiseModal onClose={() => setIsAdvertiseOpen(false)} />
      )}
    </div>
  );
}
