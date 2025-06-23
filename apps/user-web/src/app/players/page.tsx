'use client'

import { useState, useEffect } from 'react';
import styles from './field.module.css';
import { useMediaQuery } from 'react-responsive';

const playerList = [
  { name: 'Samuel', info: 'Captain and Centre-Back', photo: '/coach_1.jpg' },
  { name: 'Cauden', info: 'Striker', photo: '/coach_1.jpg' },
  { name: 'Advik', info: 'Midfielder', photo: '/coach_1.jpg' },
  { name: 'Khan', info: 'Goalkeeper', photo: '/coach_1.jpg' },
  { name: 'Sriram Sai', info: 'Right Back', photo: '/coach_1.jpg' },
  { name: 'Henry', info: 'Left Back', photo: '/coach_1.jpg' },
  { name: 'Sanjit', info: 'Defensive Midfielder', photo: '/coach_1.jpg' },
  { name: 'Tiwari', info: 'Defensive Midfielder', photo: '/coach_1.jpg' },
  { name: 'Vihari', info: 'Attacking Midfielder', photo: '/coach_1.jpg' },
  { name: 'Trey', info: 'Right Winger', photo: '/coach_1.jpg' },
  { name: 'Lucas', info: 'Left Winger', photo: '/coach_1.jpg' },
];

function getGridPositions(count: number, rows: number, cols: number) {
  const positions = [];
  let playerIdx = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (playerIdx >= count) break;
      // Spread top from 15% to 85%, left from 15% to 85%
      const top = 15 + ((row * (70 / (rows - 1))) || 0); // avoid NaN for 1 row
      const left = 15 + ((col * (70 / (cols - 1))) || 0);
      positions.push({ top: `${top}%`, left: `${left}%` });
      playerIdx++;
    }
  }
  return positions;
}

export default function Field() {
  const [hoveredPlayer, setHoveredPlayer] = useState<number | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const openLightbox = (src: string) => {
    setLightboxImage(src);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const isTabletOrLarger = useMediaQuery({ minWidth: 767 });
  const cols = 3;
  const rows = Math.ceil(playerList.length / cols);
  const positions = getGridPositions(playerList.length, rows, cols);

  if (!hasMounted) return null; // prevent mismatch

  return (
    <>
      <div className={styles.containerWrapper}>
        <div className={styles.textBox}>
  <h2>Team Formation</h2>
  <p><strong>Pattern:</strong> 3 in a row</p>
  <h3>Players</h3>
  <div className={styles.positionList}>
    {playerList.map((p, i) => (
      <p key={i}><strong>{p.name}</strong></p>
    ))}
  </div>
  <div className={styles.instructions}>
    <p><em>Hover over players on the field to see their positions.</em></p>
  </div>
</div>
        <div className={styles.fieldContainer}>
          {playerList.map((player, i) => (
            <div
              key={i}
              className={styles.player}
              style={{ top: positions[i].top, left: positions[i].left }}
              onMouseEnter={() => setHoveredPlayer(i)}
              onMouseLeave={() => setHoveredPlayer(null)}
            >
              <div className={styles.playerImageWrapper} onClick={() => openLightbox(player.photo)}>
                <img src={player.photo} alt={player.name} className={styles.playerImage} />
              </div>
              <span className={styles.name}>{player.name}</span>
              {hoveredPlayer === i && (
                <div className={styles.tooltip}>{player.info}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      {lightboxImage && (
        <div className={styles.lightbox} onClick={closeLightbox}>
          <span className={styles.closeButton}>&times;</span>
          <img src={lightboxImage} alt="Lightbox" className={styles.lightboxImage} />
        </div>
      )}
    </>
  );
}