// Pure HTML5 Canvas recreation of the user's KIDOLU icon + wordmark + Subscribe end card.
import { INK } from './toon.js';
import { clamp, lerp, eo, eob, seg } from './lib.js';

export function drawKidoluIcon(ctx, x, y, s = 1) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  const W = 220, R = 52;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.22)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
  ctx.beginPath(); ctx.roundRect(-W / 2, -W / 2, W, W, R); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  ctx.restore();

  // Four-quadrant colourful outer frame clipped to rounded icon shape
  ctx.save();
  ctx.beginPath(); ctx.roundRect(-W / 2, -W / 2, W, W, R); ctx.clip();
  // Blue top-left
  ctx.fillStyle = '#0F8CFF'; ctx.fillRect(-W / 2, -W / 2, W * 0.54, W * 0.62);
  // Yellow top-right
  ctx.fillStyle = '#FFD11A'; ctx.fillRect(-2, -W / 2, W / 2 + 2, W * 0.56);
  // Orange bottom-right
  ctx.fillStyle = '#FF7A00'; ctx.fillRect(-20, 0, W / 2 + 20, W / 2);
  // Coral-Red bottom-left
  ctx.fillStyle = '#F73E3E'; ctx.fillRect(-W / 2, 16, W * 0.48, W / 2 - 16);
  ctx.restore();

  // White inner rounded card
  const IW = 176, IR = 36;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.14)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
  ctx.beginPath(); ctx.roundRect(-IW / 2, -IW / 2, IW, IW, IR); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  ctx.restore();

  // Stylized K inside: Left blue pill bar
  ctx.save();
  ctx.beginPath(); ctx.roundRect(-62, -62, 46, 124, 12);
  const gL = ctx.createLinearGradient(-62, -62, -16, 62);
  gL.addColorStop(0, '#0E9CFF'); gL.addColorStop(1, '#006BE6');
  ctx.fillStyle = gL; ctx.fill();
  ctx.clip();
  // Gloss highlight arc + lighter bottom wave
  ctx.fillStyle = 'rgba(130,220,255,0.45)';
  ctx.beginPath(); ctx.arc(-20, 66, 54, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(-44, -42, 14, Math.PI, Math.PI * 1.5); ctx.stroke();
  // Yellow 4-point sparkle + white dot inside blue bar
  const sx = -32, sy = -4, sr = 13;
  ctx.fillStyle = '#FFE01B';
  ctx.beginPath();
  ctx.moveTo(sx, sy - sr); ctx.quadraticCurveTo(sx + 2, sy - 2, sx + sr, sy);
  ctx.quadraticCurveTo(sx + 2, sy + 2, sx, sy + sr); ctx.quadraticCurveTo(sx - 2, sy + 2, sx - sr, sy);
  ctx.quadraticCurveTo(sx - 2, sy - 2, sx, sy - sr); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(-46, 12, 4, 0, 7); ctx.fill();
  ctx.restore();

  // Upper right K wing (Golden-Orange)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-2, -58); ctx.lineTo(56, -58); ctx.quadraticCurveTo(66, -58, 58, -48);
  ctx.lineTo(-2, 4); ctx.closePath();
  const gT = ctx.createLinearGradient(0, -58, 58, 4);
  gT.addColorStop(0, '#FFD41F'); gT.addColorStop(1, '#FF8800');
  ctx.fillStyle = gT; ctx.fill();
  ctx.restore();

  // Lower right K wing (Coral-Red)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-2, 0); ctx.lineTo(58, 52); ctx.quadraticCurveTo(64, 60, 52, 60);
  ctx.lineTo(-2, 60); ctx.closePath();
  const gB = ctx.createLinearGradient(0, 0, 58, 60);
  gB.addColorStop(0, '#FF5447'); gB.addColorStop(1, '#E8292E');
  ctx.fillStyle = gB; ctx.fill();
  ctx.restore();

  ctx.restore();
}

export function drawKidoluWordmark(ctx, x, y, s = 1) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  const letters = [
    ['K', '#0A8AFF'], ['I', '#FFC914'], ['D', '#FF7800'],
    ['O', '#F73E3E'], ['L', '#0A8AFF'], ['U', '#FFC914'],
  ];
  ctx.font = '900 104px Inter'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  const xs = [-178, -114, -50, 26, 100, 174];
  letters.forEach(([ch, col], i) => {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.22)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 6;
    ctx.lineJoin = 'round'; ctx.lineWidth = 10; ctx.strokeStyle = '#FFFFFF'; ctx.strokeText(ch, xs[i], 0);
    ctx.fillStyle = col; ctx.fillText(ch, xs[i], 0);
    ctx.restore();
  });
  // Cheerful red smile under O-L
  ctx.strokeStyle = '#F73E3E'; ctx.lineWidth = 11; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(62, 34, 44, 0.25, Math.PI - 0.25); ctx.stroke();
  // Three yellow rays over U
  ctx.strokeStyle = '#FFC914'; ctx.lineWidth = 8;
  [[-18, -58, -28, -78], [0, -64, 0, -86], [18, -58, 28, -78]].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath(); ctx.moveTo(174 + x1, y1); ctx.lineTo(174 + x2, y2); ctx.stroke();
  });
  ctx.restore();
}

/** Friendly KIDOLU moral + subscribe card overlay */
export function drawEndCard(ctx, pMoral, pSub, t) {
  if (pMoral > 0) {
    const sc = eob(clamp(pMoral));
    ctx.save(); ctx.translate(540, 200); ctx.scale(sc, sc);
    ctx.shadowColor = 'rgba(0,0,0,0.32)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#FFFDF5'; ctx.strokeStyle = INK; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.roundRect(-410, -64, 820, 128, 36); ctx.fill(); ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.font = '900 52px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0A8AFF'; ctx.fillText('Being brave means trying!', 0, -2);
    ctx.restore();
  }
  if (pSub > 0) {
    const sc = eob(clamp(pSub));
    ctx.save(); ctx.translate(540, 445); ctx.scale(sc, sc);
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = INK; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.roundRect(-420, -140, 840, 280, 48); ctx.fill(); ctx.stroke();
    ctx.shadowColor = 'transparent';
    drawKidoluIcon(ctx, -230, -34, 0.66);
    drawKidoluWordmark(ctx, 115, -30, 0.84);
    // Subscribe pill with bounce pulse and clean padding
    const pulse = 1 + Math.sin(t * 9) * 0.04;
    ctx.save(); ctx.translate(0, 82); ctx.scale(pulse, pulse);
    ctx.fillStyle = '#F73E3E'; ctx.strokeStyle = INK; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.roundRect(-255, -34, 510, 68, 34); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#FFFFFF'; ctx.font = '900 35px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('SUBSCRIBE FOR MORE!', 0, 2);
    ctx.restore();
    ctx.restore();
  }
}

