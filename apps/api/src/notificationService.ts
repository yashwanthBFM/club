import { prisma } from './db';
import type { NotificationType } from '@prisma/client';

interface CreateNotificationParams {
  userId: number;
  message: string;
  type?: NotificationType;
  relatedEntityType?: string;
  relatedEntityId?: number;
}

export const createNotification = async (params: CreateNotificationParams) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        message: params.message,
        type: params.type,
        relatedEntityType: params.relatedEntityType,
        relatedEntityId: params.relatedEntityId,
      },
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    // Depending on requirements, you might want to throw the error
    // or handle it silently if notification creation isn't critical path.
    return null;
  }
}; 