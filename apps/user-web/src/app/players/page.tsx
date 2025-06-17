'use client'

import { useState, useEffect } from 'react';
import styles from './field.module.css';
import { useMediaQuery } from 'react-responsive';
import Navbar2 from '../Navbar2';

const playersSmall = [
  { name: 'Samuel – CB', top: '70%', left: '50%', info: 'Captain and Centre-Back',photo: '/coach_1.jpg' },
  { name: 'Cauden – ST', top: '20%', left: '50%', info: 'Striker',photo: '/coach_1.jpg' },
  { name: 'Advik – CM', top: '52%', left: '25%', info: 'Midfielder',photo: '/coach_1.jpg' },
  { name: 'Khan – GK', top: '90%', left: '50%', info: 'Goalkeeper',photo: '/coach_1.jpg' },
  { name: 'Sriram Sai – RB', top: '65%', left: '80%', info: 'Right Back',photo: '/coach_1.jpg' },
  { name: 'Henry – LB', top: '65%', left: '20%', info: 'Left Back',photo: '/coach_1.jpg' },
  { name: 'Sanjit – CDM', top: '52%', left: '43%', info: 'Defensive Midfielder',photo: '/coach_1.jpg' },
    { name: 'Tiwari – CDM', top: '52%', left: '57%', info: 'Defensive Midfielder',photo: '/coach_1.jpg' },
  { name: 'Vihari – CAM', top: '52%', left: '75%', info: 'Attacking Midfielder',photo: '/coach_1.jpg' },
  { name: 'Trey – RW', top: '35%', left: '80%', info: 'Right Winger' ,photo: '/coach_1.jpg'},
  { name: 'Lucas – LW', top: '35%', left: '20%', info: 'Left Winger' ,photo: '/coach_1.jpg'},

];

const playersLarge = [
  { name: 'Samuel – CB', top: '70%', left: '50%', info: 'Captain and Centre-Back',photo: '/coach_1.jpg' },
  { name: 'Cauden – ST', top: '20%', left: '50%', info: 'Striker',photo: '/coach_1.jpg' },
  { name: 'Advik – CM', top: '52%', left: '25%', info: 'Midfielder',photo: '/coach_1.jpg' },
  { name: 'Khan – GK', top: '90%', left: '50%', info: 'Goalkeeper',photo: '/coach_1.jpg' },
  { name: 'Sriram Sai – RB', top: '65%', left: '60%', info: 'Right Back',photo: '/coach_1.jpg' },
  { name: 'Henry – LB', top: '65%', left: '40%', info: 'Left Back',photo: '/coach_1.jpg' },
  { name: 'Sanjit – CDM', top: '52%', left: '40%', info: 'Defensive Midfielder',photo: '/coach_1.jpg' },
  { name: 'Tiwari – CDM', top: '52%', left: '60%', info: 'Defensive Midfielder',photo: '/coach_1.jpg' },
  { name: 'Vihari – CAM', top: '52%', left: '75%', info: 'Attacking Midfielder',photo: '/coach_1.jpg' },
  { name: 'Trey – RW', top: '35%', left: '60%', info: 'Right Winger' ,photo: '/coach_1.jpg'},
  { name: 'Lucas – LW', top: '35%', left: '40%', info: 'Left Winger' ,photo: '/coach_1.jpg'},
];

export default function Field() {
  const [hoveredPlayer, setHoveredPlayer] = useState<number | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const isTabletOrLarger = useMediaQuery({ minWidth: 767 });

  if (!hasMounted) return null; // prevent mismatch

  const players = isTabletOrLarger ? playersLarge : playersSmall;

  return (
    <>
      <Navbar2 />
      <div className={styles.containerWrapper}>
        <div className={styles.textBox}>
  <h2>Team Formation</h2>
  <p><strong>Formation:</strong> 3-4-3</p>
  <p><strong>Captain:</strong> Samuel (CB)</p>
  
  <h3>Starting XI</h3>
  <div className={styles.positionList}>
    <p><strong>GK:</strong> Khan</p>
    <p><strong>Defense:</strong> Henry, Samuel, Sriram Sai</p>
    <p><strong>Midfield:</strong> Advik, Sanjit, Tiwari, Vihari</p>
    <p><strong>Attack:</strong> Lucas, Cauden, Trey</p>
  </div>

  <h3>Substitutes</h3>
  <p><strong>GK:</strong> MR.X</p>
  
  <div className={styles.gameInfo}>
    <h3>Match Info</h3>
    <p><strong>Next Match:</strong> TBD</p>
    <p><strong>Competition:</strong> League</p>
    <p><strong>Home/Away:</strong> Home</p>
  </div>

  <div className={styles.instructions}>
    <p><em>Hover over players on the field to see their positions.</em></p>
  </div>
</div>


        <div className={styles.fieldContainer}>
          {players.map((player, i) => (
            <div
              key={i}
              className={styles.player}
              style={{ top: player.top, left: player.left }}
              onMouseEnter={() => setHoveredPlayer(i)}
              onMouseLeave={() => setHoveredPlayer(null)}
            >
              <div className={styles.playerImageWrapper}>
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
    </>
  );
}