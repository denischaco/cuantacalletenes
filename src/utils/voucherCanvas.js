/**
 * Renderizador de Voucher de Descuento Oficial en HTML Canvas (1080x1440 HD)
 * Genera una tarjeta de beneficio digital con ID único, timestamp de emisión y términos.
 */

export async function downloadCouponVoucher(sponsor, couponData) {
  if (typeof document === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1440; // Proporción vertical óptima para smartphones y estados de WhatsApp
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Fondo Oscuro Principal con degradé premium
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1440);
  bgGrad.addColorStop(0, '#0F172A'); // slate-900
  bgGrad.addColorStop(0.5, '#020617'); // slate-950
  bgGrad.addColorStop(1, '#0F172A');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1440);

  // 2. Bordes decorativos con paleta de marca (#F48138 y #339136)
  ctx.strokeStyle = '#F48138';
  ctx.lineWidth = 12;
  ctx.strokeRect(36, 36, 1080 - 72, 1440 - 72);

  // Borde interior fino verde marca
  ctx.strokeStyle = '#339136';
  ctx.lineWidth = 3;
  ctx.strokeRect(52, 52, 1080 - 104, 1440 - 104);

  // 3. Encabezado del Juego
  ctx.textAlign = 'center';
  ctx.fillStyle = '#F48138';
  ctx.font = 'bold 36px system-ui, sans-serif';
  ctx.fillText('¿CUÁNTA CALLE TENÉS? | RESISTENCIA', 540, 120);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '22px system-ui, sans-serif';
  ctx.fillText('VOUCHER OFICIAL DE BENEFICIO EXCLUSIVO', 540, 160);

  // Línea divisoria
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 195);
  ctx.lineTo(980, 195);
  ctx.stroke();

  // 4. Nombre y Rubro del Sponsor
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 60px system-ui, sans-serif';
  ctx.fillText(sponsor.name.toUpperCase(), 540, 275);

  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 28px system-ui, sans-serif';
  ctx.fillText(`${sponsor.rubro || 'Comercio Destacado'} • ${sponsor.address || 'Resistencia'}`, 540, 325);

  // 5. Bloque Central de Descuento
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.roundRect(100, 370, 880, 240, 28);
  ctx.fill();
  ctx.strokeStyle = '#339136';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#4ADE80';
  ctx.font = '900 96px system-ui, sans-serif';
  ctx.fillText(couponData.discount, 540, 490);

  ctx.fillStyle = '#E2E8F0';
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.fillText(couponData.title || sponsor.coupon?.title || 'Descuento Exclusivo', 540, 560);

  // 6. Tarjeta de Verificación de Seguridad (ID Único + Timestamp)
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.roundRect(100, 640, 880, 240, 24);
  ctx.fill();
  ctx.strokeStyle = '#F59E0B'; // Ámbar de advertencia/seguridad
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#F59E0B';
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.fillText('DATOS DE VALIDACIÓN EN CAJA (UN SOLO USO):', 140, 690);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 42px monospace';
  ctx.fillText(`ID: ${couponData.uniqueId}`, 140, 750);

  ctx.fillStyle = '#CBD5E1';
  ctx.font = '24px system-ui, sans-serif';
  ctx.fillText(`Emitido: ${couponData.formattedIssuedAt} hs`, 140, 800);
  ctx.fillText(`Vence:   ${couponData.formattedExpiresAt} hs`, 140, 840);

  // 7. Alcance y Términos Comerciales Aclaratorios
  ctx.textAlign = 'left';
  ctx.fillStyle = '#F48138';
  ctx.font = 'bold 28px system-ui, sans-serif';
  ctx.fillText(`ALCANCE: ${couponData.scopeLabel || sponsor.coupon?.scopeLabel || 'Descuento Comercial'}`, 100, 930);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '22px system-ui, sans-serif';
  const methods = couponData.paymentMethods?.join(', ') || sponsor.coupon?.paymentMethods?.join(', ') || 'Consultar en local';
  ctx.fillText(`Medios de pago admitidos: ${methods}`, 100, 970);

  // Lista de Términos
  ctx.fillStyle = '#CBD5E1';
  ctx.font = '21px system-ui, sans-serif';
  let yPos = 1020;
  const termsList = couponData.terms || sponsor.coupon?.terms || [
    'Presentar la captura con ID legible en caja antes de pedir la cuenta.',
    'No acumulable con otras promociones vigentes.'
  ];

  termsList.slice(0, 5).forEach((term) => {
    ctx.fillText(`• ${term}`, 100, yPos);
    yPos += 42;
  });

  // 8. Pie de Control y Anti-Fraude
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748B';
  ctx.font = 'italic 20px system-ui, sans-serif';
  ctx.fillText('El local se reserva el derecho de verificar la validez del ID en su registro interno.', 540, 1345);
  ctx.fillText('Desarrollado por cuantacalletenes.denischaco.com.ar', 540, 1380);

  // 9. Descarga automática en PNG
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `cupon-${sponsor.id}-${couponData.uniqueId}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
