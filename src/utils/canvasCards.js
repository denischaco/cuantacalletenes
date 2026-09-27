/**
 * Utility to generate downloadable PNG image cards for:
 * 1. 1v1 Challenge Head-to-Head duel results
 * 2. Sponsor discount coupons to show at store counters
 */

/**
 * Generates and downloads a 1v1 Challenge Result Card as PNG
 */
export function downloadChallengeCard({
  creatorName = 'Rival',
  creatorScore = 0,
  creatorTimeMs = 0,
  playerName = 'Jugador',
  playerScore = 0,
  playerTimeMs = 0,
  zoneName = 'Resistencia',
  winnerText = '¡Ganador!'
}) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350; // 4:5 Instagram/WhatsApp portrait format
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background gradient: Deep night slate with Chaco accents
  const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
  bgGrad.addColorStop(0, '#070A12');
  bgGrad.addColorStop(0.5, '#0B0F19');
  bgGrad.addColorStop(1, '#1A0D05');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1350);

  // Decorative ambient glow
  const glowGrad1 = ctx.createRadialGradient(200, 200, 10, 200, 200, 450);
  glowGrad1.addColorStop(0, 'rgba(51, 145, 54, 0.25)'); // #339136
  glowGrad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glowGrad1;
  ctx.fillRect(0, 0, 1080, 700);

  const glowGrad2 = ctx.createRadialGradient(880, 1150, 10, 880, 1150, 450);
  glowGrad2.addColorStop(0, 'rgba(244, 129, 56, 0.22)'); // #F48138
  glowGrad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glowGrad2;
  ctx.fillRect(0, 600, 1080, 750);

  // Outer border with gold/orange touch
  ctx.strokeStyle = 'rgba(244, 129, 56, 0.4)';
  ctx.lineWidth = 12;
  ctx.strokeRect(30, 30, 1020, 1290);

  // Header Game Brand
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 46px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('¿CUÁNTA CALLE TENÉS?', 540, 130);

  ctx.fillStyle = '#38BDF8';
  ctx.font = '600 28px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Resistencia, Chaco • Zona: ${zoneName.toUpperCase()}`, 540, 180);

  // 1v1 Badge
  ctx.fillStyle = 'rgba(244, 129, 56, 0.15)';
  ctx.beginPath();
  ctx.roundRect(390, 220, 300, 52, 26);
  ctx.fill();
  ctx.strokeStyle = '#F48138';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#FFA559';
  ctx.font = '800 24px system-ui, -apple-system, sans-serif';
  ctx.fillText('⚔️ DUELO 1v1 OFICIAL', 540, 255);

  // Winner Announcement Ribbon
  ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
  ctx.beginPath();
  ctx.roundRect(140, 320, 800, 100, 24);
  ctx.fill();
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#34D399';
  ctx.font = '900 44px system-ui, -apple-system, sans-serif';
  ctx.fillText(winnerText, 540, 385);

  // Player 1 Card (Retador)
  drawPlayerCard(ctx, {
    x: 80,
    y: 470,
    width: 410,
    height: 520,
    title: 'RETADOR',
    name: creatorName,
    score: creatorScore,
    timeMs: creatorTimeMs,
    accentColor: '#38BDF8',
    isWinner: creatorScore > playerScore || (creatorScore === playerScore && creatorTimeMs <= playerTimeMs)
  });

  // VS Badge in center (compact circular badge that does not collide with cards)
  ctx.save();
  ctx.beginPath();
  ctx.arc(540, 730, 36, 0, Math.PI * 2);
  ctx.fillStyle = '#0F172A';
  ctx.fill();
  ctx.strokeStyle = '#F48138';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#FFA559';
  ctx.font = '900 24px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VS', 540, 730);
  ctx.restore();

  // Player 2 Card (Vos)
  drawPlayerCard(ctx, {
    x: 590,
    y: 470,
    width: 410,
    height: 520,
    title: 'DESAFIADO',
    name: playerName,
    score: playerScore,
    timeMs: playerTimeMs,
    accentColor: '#34D399',
    isWinner: playerScore > creatorScore || (playerScore === creatorScore && playerTimeMs < creatorTimeMs)
  });

  // Footer / Watermark
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '500 24px system-ui, -apple-system, sans-serif';
  ctx.fillText('¿Y vos cuánta calle tenés? Jugá gratis en:', 540, 1140);

  ctx.fillStyle = '#F48138';
  ctx.font = '800 32px system-ui, -apple-system, sans-serif';
  ctx.fillText('cuantacalletenes.denischaco.com.ar', 540, 1190);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.font = '500 20px system-ui, -apple-system, sans-serif';
  ctx.fillText('Desarrollado por Denis Giménez (@denischaco) • Resistencia, Chaco', 540, 1260);

  // Trigger browser download
  triggerDownload(canvas, `duelo-1v1-${creatorName}-vs-${playerName}.png`);
}

function drawPlayerCard(ctx, { x, y, width, height, title, name, score, timeMs, accentColor, isWinner }) {
  // Card base
  ctx.fillStyle = isWinner ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.85)';
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 28);
  ctx.fill();

  ctx.strokeStyle = isWinner ? accentColor : 'rgba(71, 85, 105, 0.6)';
  ctx.lineWidth = isWinner ? 6 : 2;
  ctx.stroke();

  // Role pill
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.roundRect(x + width / 2 - 80, y + 25, 160, 36, 18);
  ctx.fill();
  ctx.fillStyle = '#94A3B8';
  ctx.font = '700 18px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, x + width / 2, y + 50);

  // Player Name with dynamic sizing so names like denischaco don't get truncated
  ctx.fillStyle = '#FFFFFF';
  const nameFontSize = name.length > 12 ? 26 : name.length > 9 ? 30 : 34;
  ctx.font = `900 ${nameFontSize}px system-ui, sans-serif`;
  const truncatedName = name.length > 18 ? name.slice(0, 17) + '…' : name;
  ctx.fillText(truncatedName, x + width / 2, y + 120);

  // Score
  ctx.fillStyle = accentColor;
  ctx.font = '900 100px system-ui, sans-serif';
  ctx.fillText(String(score), x + width / 2, y + 260);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '700 26px system-ui, sans-serif';
  ctx.fillText('DE 10 PUNTOS', x + width / 2, y + 305);

  // Time
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.roundRect(x + 35, y + 350, width - 70, 70, 20);
  ctx.fill();

  ctx.fillStyle = '#FCD34D';
  ctx.font = '800 28px system-ui, sans-serif';
  const timeSec = timeMs > 0 ? `${(timeMs / 1000).toFixed(1)}s` : '--';
  ctx.fillText(`⏱️ ${timeSec}`, x + width / 2, y + 395);

  // Status badge
  if (isWinner) {
    ctx.fillStyle = '#10B981';
    ctx.font = '900 26px system-ui, sans-serif';
    ctx.fillText('👑 GANADOR', x + width / 2, y + 475);
  } else {
    ctx.fillStyle = '#64748B';
    ctx.font = '700 22px system-ui, sans-serif';
    ctx.fillText('COMPETIDOR', x + width / 2, y + 475);
  }
}

/**
 * Generates and downloads a Sponsor Coupon Ticket Image as PNG
 */
export function downloadCouponCard({
  sponsorName = 'Comercio Local',
  discount = '15% OFF',
  code = 'CALLE-DESCUENTO',
  address = 'Resistencia, Chaco',
  expiresAt = '2026-12-31',
  instructions = 'Mostrá esta pantalla o captura en la caja para activar tu descuento.',
  title = 'Cupón Oficial de Descuento'
}) {
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 650; // Ticket coupon landscape format
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  const bg = ctx.createLinearGradient(0, 0, 1000, 650);
  bg.addColorStop(0, '#1E120A');
  bg.addColorStop(0.5, '#0B0F19');
  bg.addColorStop(1, '#1A0C03');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1000, 650);

  // Ticket Border dashed
  ctx.strokeStyle = '#F48138';
  ctx.lineWidth = 6;
  ctx.strokeRect(25, 25, 950, 600);

  // Header Ribbon
  ctx.fillStyle = '#F48138';
  ctx.fillRect(25, 25, 950, 75);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 32px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎟️ CUPÓN OFICIAL • ¿CUÁNTA CALLE TENÉS?', 500, 75);

  // Sponsor Name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 52px system-ui, -apple-system, sans-serif';
  ctx.fillText(sponsorName, 500, 170);

  ctx.fillStyle = '#FFA559';
  ctx.font = '700 26px system-ui, -apple-system, sans-serif';
  ctx.fillText(title, 500, 215);

  // Big Discount Badge Box
  ctx.fillStyle = 'rgba(244, 129, 56, 0.15)';
  ctx.beginPath();
  ctx.roundRect(100, 250, 800, 150, 24);
  ctx.fill();
  ctx.strokeStyle = '#F48138';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#34D399';
  ctx.font = '900 70px system-ui, -apple-system, sans-serif';
  ctx.fillText(discount, 500, 325);

  ctx.fillStyle = '#FDE68A';
  ctx.font = '800 34px monospace';
  ctx.fillText(`CÓDIGO: ${code}`, 500, 375);

  // Address and instructions
  ctx.fillStyle = '#CBD5E1';
  ctx.font = '600 24px system-ui, -apple-system, sans-serif';
  ctx.fillText(`📍 Válido en: ${address}`, 500, 445);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '500 20px system-ui, -apple-system, sans-serif';
  ctx.fillText(instructions, 500, 490);

  ctx.fillStyle = '#F48138';
  ctx.font = '700 20px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Vigencia hasta: ${expiresAt} • Mostrá esta imagen en caja`, 500, 535);

  // Footer brand
  ctx.fillStyle = '#64748B';
  ctx.font = '600 18px system-ui, -apple-system, sans-serif';
  ctx.fillText('Juego de Geografía Urbana • cuantacalletenes.denischaco.com.ar', 500, 595);

  // Trigger download
  const safeName = sponsorName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  triggerDownload(canvas, `cupon-${safeName}.png`);
}

function triggerDownload(canvas, filename) {
  try {
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error('Error generating image download:', err);
  }
}
