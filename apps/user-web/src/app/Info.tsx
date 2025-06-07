import styles from './info.module.css';

export default function Info() {
  return (
    <>
    <section className={styles.infoSection}>
      {/* First Block: Text Left, Image Right */}
      <div className={styles.infoBlock}>
        <div className={styles.textContent}>
          <h2>Coach James Carter – Head Coach</h2>
          <p>Coach James brings over 12 years of coaching experience across youth academies and semi-professional clubs in Europe. Known for his strategic mindset and player-first approach, he focuses on developing intelligent, adaptable players who understand the game beyond the ball. His training sessions are intense, purposeful, and rooted in real match scenarios.</p>
        </div>
        <img src="/coach1.jpeg" alt="Game Scene 1" className={styles.image} />
      </div>

      {/* Second Block: Image Left, Text Right */}
      <div className={`${styles.infoBlock} ${styles.reverse}`}>
        <div className={styles.textContent}>
          <h2>Coach Lucas Bennett – </h2>
          <p>Lucas is the driving force behind the squad’s speed, stamina, and skill. With a background in sports physiology and elite training methods, he pushes players to unlock their athletic and technical potential. His high-energy sessions are designed to simulate real-game pressure while sharpening footwork, reaction time, and overall fitness.</p>
        </div>
        <img src="/coach2.jpeg" alt="Game Scene 2" className={styles.image} />
      </div>

    <div className={`${styles.infoBlock2}`}>
  <div className={styles.infoBlockGrid}>
    {[
      { name: 'Ethan Reyes – Captain | Centre-Back', image: '/coach1.jpeg' },
      { name: 'Leo Morgan – Striker', image: '/coach2.jpeg' },
      { name: 'Noah Taylor – Midfielder', image: '/coach1.jpeg' },
      { name: 'Mason Blake – Goalkeeper', image: '/coach2.jpeg' },
    ].map((player, index) => (
      <div key={index} className={styles.playerCard}>
        <img src={player.image} alt={player.name} className={styles.playerImage} />
        <h3 className={styles.playerName}>{player.name}</h3>
      </div>
    ))}
  </div>
  <div className={styles.infoBlockGrid}>
    {[
      { name: 'Owen Scott – Right Back', image: '/coach1.jpeg' },
      { name: 'Lucas Grant – Left Back', image: '/coach2.jpeg' },
      { name: 'Aiden Cruz – Defensive Midfielder', image: '/coach1.jpeg' },
      { name: 'Caleb James – Attacking Midfielder', image: '/coach2.jpeg' },
    ].map((player, index) => (
      <div key={index} className={styles.playerCard}>
        <img src={player.image} alt={player.name} className={styles.playerImage} />
        <h3 className={styles.playerName}>{player.name}</h3>
      </div>
    ))}
  </div>

  <div className={styles.infoBlockGrid}>
    {[
      { name: 'Nathan Reed – Winger', image: '/coach1.jpeg' },
      { name: 'Logan Hayes – Winger', image: '/coach2.jpeg' },
      { name: 'Jackson Cole – Substitute GK', image: '/coach1.jpeg' },
    ].map((player, index) => (
      <div key={index} className={styles.playerCard}>
        <img src={player.image} alt={player.name} className={styles.playerImage} />
        <h3 className={styles.playerName}>{player.name}</h3>
      </div>
    ))}
  </div>
</div>

    </section>

</>
    
  );
}
