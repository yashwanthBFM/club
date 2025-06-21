import styles from './info.module.css';
import Link from 'next/link';

export default function Info() {
  return (
<section className={`${styles.infoSection} ${styles.parallaxTeamSection}`}>

      <h1 className={styles.infoTitle}>Meet Our Team</h1>
      {/* First Block: Text Left, Image Right */}
      <div className={styles.infoBlock} data-card-type="coach">
        <div className={styles.textContent}>
          <h2>Rikardo Gharzouzi - Head Coach</h2>
          <p>Coach James brings over 12 years of coaching experience across youth academies and semi-professional clubs in Europe. Known for his strategic mindset and player-first approach, he focuses on developing intelligent, adaptable players who understand the game beyond the ball. His training sessions are intense, purposeful, and rooted in real match scenarios.</p>
        </div>
        <img src="/coach_1.jpg" alt="Game Scene 1" className={styles.coachImage} />
      </div>

      {/* Second Block: Image Left, Text Right */}
      <div className={`${styles.infoBlock} ${styles.reverse}`} data-card-type="coach">
        <div className={styles.textContent}>
          <h2>Micheal Herscovici - Sub Coach</h2>
          <p>Lucas is the driving force behind the squad's speed, stamina, and skill. With a background in sports physiology and elite training methods, he pushes players to unlock their athletic and technical potential. His high-energy sessions are designed to simulate real-game pressure while sharpening footwork, reaction time, and overall fitness.</p>
        </div>
        <img src="/subcoach.jpeg" alt="Coach 2" className={styles.coachImage} />
      </div>

      <div className={styles.teamButtonWrapper}>
        <Link href="/players" className={styles.teamButton}>
          Meet Our Team ↗
     </Link>
      </div>

    </section>

    
  );
}