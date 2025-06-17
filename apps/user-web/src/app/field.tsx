import { useState, useEffect } from 'react';
import styles from './field.module.css';
import { useMediaQuery } from 'react-responsive';

const playersSmall = [
  { name: 'Ethan – CB', top: '70%', left: '50%', info: 'Captain and Centre-Back',photo: '/coach_1.jpg' },
  { name: 'Leo – ST', top: '20%', left: '50%', info: 'Striker',photo: '/coach_1.jpg' },
  { name: 'Noah – CM', top: '52%', left: '25%', info: 'Midfielder',photo: '/coach_1.jpg' },
  { name: 'Mason – GK', top: '90%', left: '50%', info: 'Goalkeeper',photo: '/coach_1.jpg' },
  { name: 'Owen – RB', top: '65%', left: '80%', info: 'Right Back',photo: '/coach_1.jpg' },
  { name: 'Lucas – LB', top: '65%', left: '20%', info: 'Left Back',photo: '/coach_1.jpg' },
  { name: 'Aiden – CDM', top: '52%', left: '50%', info: 'Defensive Midfielder',photo: '/coach_1.jpg' },
  { name: 'Caleb – CAM', top: '52%', left: '75%', info: 'Attacking Midfielder',photo: '/coach_1.jpg' },
  { name: 'Nathan – RW', top: '35%', left: '80%', info: 'Right Winger' ,photo: '/coach_1.jpg'},
  { name: 'Logan – LW', top: '35%', left: '20%', info: 'Left Winger' ,photo: '/coach_1.jpg'},
  { name: 'Jackson – Sub GK', top: '95%', left: '20%', info: 'Substitute Goalkeeper',photo: '/coach_1.jpg' },
];

const playersLarge = [
  { name: 'Ethan – CB', top: '70%', left: '50%', info: 'Captain and Centre-Back',photo: '/coach_1.jpg' },
  { name: 'Leo – ST', top: '20%', left: '50%', info: 'Striker',photo: '/coach_1.jpg' },
  { name: 'Noah – CM', top: '52%', left: '35%', info: 'Midfielder',photo: '/coach_1.jpg' },
  { name: 'Mason – GK', top: '90%', left: '50%', info: 'Goalkeeper',photo: '/coach_1.jpg' },
  { name: 'Owen – RB', top: '65%', left: '60%', info: 'Right Back',photo: '/coach_1.jpg' },
  { name: 'Lucas – LB', top: '65%', left: '40%', info: 'Left Back',photo: '/coach_1.jpg' },
  { name: 'Aiden – CDM', top: '52%', left: '50%', info: 'Defensive Midfielder',photo: '/coach_1.jpg' },
  { name: 'Caleb – CAM', top: '52%', left: '65%', info: 'Attacking Midfielder',photo: '/coach_1.jpg' },
  { name: 'Nathan – RW', top: '35%', left: '60%', info: 'Right Winger' ,photo: '/coach_1.jpg'},
  { name: 'Logan – LW', top: '35%', left: '40%', info: 'Left Winger' ,photo: '/coach_1.jpg'},
  { name: 'Jackson – Sub GK', top: '95%', left: '40%', info: 'Substitute Goalkeeper',photo: '/coach_1.jpg' },
];

export default function Field() {
  const [hoveredPlayer, setHoveredPlayer] = useState<number | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const isTabletOrLarger = useMediaQuery({ minWidth: 768 });

  if (!hasMounted) return null; // prevent mismatch

  const players = isTabletOrLarger ? playersLarge : playersSmall;

  return (
    <div className={styles.containerWrapper}>
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
  );
}