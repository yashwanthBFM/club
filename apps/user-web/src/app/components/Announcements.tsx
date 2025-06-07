"use client";

import { useEffect, useState } from 'react';
import styles from './Announcements.module.css';
import api from '@/lib/api';

interface Announcement {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  createdBy: {
    id: number;
    name: string;
  };
}

interface AnnouncementsResponse {
  announcements: Announcement[];
  message: string;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await api.get<AnnouncementsResponse>('/announcements');
        const data: AnnouncementsResponse = response.data;
        setAnnouncements(data.announcements);
        setMessage(data.message);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading announcements...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <section className={styles.announcementsSection}>
      <div className={styles.announcementsContent}>
        <h2 className={styles.announcementsTitle}>Latest Announcements</h2>
        {announcements.length === 0 ? (
          <div className={styles.noAnnouncements}>
            {message || 'No announcements available at the moment.'}
          </div>
        ) : (
          <div className={styles.announcementsGrid}>
            {announcements.map((announcement) => (
              <div key={announcement.id} className={styles.announcementCard}>
                <h3 className={styles.announcementTitle}>{announcement.title}</h3>
                <p className={styles.announcementContent}>{announcement.content}</p>
                <div className={styles.announcementMeta}>
                  <span className={styles.announcementDate}>
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                  <span className={styles.announcementAuthor}>
                    Posted by {announcement.createdBy.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
} 