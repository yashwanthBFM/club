import styles from './about.module.css';

export default function About() {
  return (
    <section className={styles.aboutSection}>
      <div className={styles.container}>
        <div className={styles.imageContainer}>
          <img src="/11.jpg" alt="About Renegades FC" className={styles.image} />
        </div>
        <div className={styles.textContainer}>
          <h2 className={styles.heading}>About Renegades FC</h2>
          <p className={styles.description}>
            Founded in 2010, Renegades FC has established itself as a premier football club dedicated to developing skilled players and outstanding individuals. Our comprehensive training programs focus on technical skills, tactical understanding, physical development, and mental strength.
          </p>
          <p className={styles.description}>
            With state-of-the-art facilities and UEFA-licensed coaches, we provide an environment where talent thrives and character is built.
          </p>
        </div>
      </div>
    </section>
  );
}
