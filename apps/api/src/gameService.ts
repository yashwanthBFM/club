import { prisma } from './db';
import { createNotification } from './notificationService';

export const createGame = async (data: {
  title: string;
  description: string;
  maxParticipants: number;
  startDate: Date;
  endDate: Date;
  location?: string;
  createdById: number;
}) => {
  return prisma.game.create({
    data: {
      ...data,
      status: 'UPCOMING',
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const registerForGame = async (gameId: number, userId: number) => {
  // Check if game exists and has available spots
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      _count: {
        select: { registrations: true },
      },
    },
  });

  if (!game) {
    throw new Error('Game not found');
  }

  if (game.status !== 'UPCOMING') {
    throw new Error('Game registration is not open');
  }

  if (game._count.registrations >= game.maxParticipants) {
    throw new Error('Game is full');
  }

  // Check if user is already registered
  const existingRegistration = await prisma.gameRegistration.findUnique({
    where: {
      gameId_userId: {
        gameId,
        userId,
      },
    },
  });

  if (existingRegistration) {
    throw new Error('Already registered for this game');
  }

  // Create registration
  const registration = await prisma.gameRegistration.create({
    data: {
      gameId,
      userId,
      status: 'REGISTERED',
    },
    include: {
      game: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Notify game creator
  await createNotification({
    userId: game.createdById,
    message: `${registration.user.name} has registered for your game "${game.title}"`,
    type: 'GAME_REGISTRATION',
    relatedEntityType: 'Game',
    relatedEntityId: gameId,
  });

  return registration;
};

export const updateGameStatus = async (gameId: number, status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED') => {
  const game = await prisma.game.update({
    where: { id: gameId },
    data: { status },
    include: {
      registrations: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  // Notify all registered users about status change
  for (const registration of game.registrations) {
    await createNotification({
      userId: registration.user.id,
      message: `Game "${game.title}" status has been updated to ${status}`,
      type: 'GAME_STATUS_CHANGE',
      relatedEntityType: 'Game',
      relatedEntityId: gameId,
    });
  }

  return game;
}; 