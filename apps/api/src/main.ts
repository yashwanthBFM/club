import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './db';
import type { OTPType, User } from '@prisma/client'; // Import User type, removed Role, added OTPType
import { authenticateToken, AuthenticatedRequest, authorizeRole } from './authMiddleware'; // Import auth middleware and authorizeRole
import { createNotification } from './notificationService'; // Import notification service
import { generateOTP, getOTPExpiry, sendOTPEmail, verifyOTP, clearOTP } from './services/otpService'; // Import OTP utilities
import cors from 'cors';
import { createGame, registerForGame, updateGameStatus } from './gameService';
import dotenv from 'dotenv';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env';
dotenv.config({ path: envFile });

// Environment variables with validation
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const SALT_ROUNDS = 10;
const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

// Registration Endpoint
app.post('/auth/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.isEmailVerified) {
      return res.status(409).json({ error: 'User already exists and is verified.' });
    }
    if (existingUser && !existingUser.isEmailVerified) {
        // Resend OTP for unverified user
        const otp = generateOTP();
        const otpExpiresAt = getOTPExpiry();
        const updatedUser = await prisma.user.update({
            where: { email },
            data: {
                name, // Allow updating name if they retry registration
                password: await bcrypt.hash(password, SALT_ROUNDS), // Allow updating password
                otp,
                otpExpiresAt,
                otpType: 'REGISTRATION',
            },
        });
        await sendOTPEmail(email, otp, 'REGISTRATION');
        return res.status(200).json({ message: 'OTP resent successfully.' });
    }


    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const otp = generateOTP();
    const otpExpiresAt = getOTPExpiry();

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        otp,
        otpExpiresAt,
        otpType: 'REGISTRATION',
        isEmailVerified: false, // Explicitly false until OTP verification
      },
    });

    await sendOTPEmail(email, otp, 'REGISTRATION');

    // Exclude password and OTP details from the initial response
    const { password: _p, otp: _o, otpExpiresAt: _oe, otpType: _ot, ...userForResponse } = newUser;
    res.status(201).json({ message: 'User registered. Please verify OTP.', userId: userForResponse.id, email: userForResponse.email, otpSent: true }); // Indicate OTP was "sent"

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// OTP Verification Endpoint
app.post('/auth/verify-otp', async (req, res) => {
  const { email, otp, type } = req.body; // type can be 'REGISTRATION' or 'PASSWORD_RESET'

  if (!email || !otp || !type) {
    return res.status(400).json({ error: 'Email, OTP, and type are required.' });
  }
  
  const validTypes: OTPType[] = ['REGISTRATION', 'PASSWORD_RESET'];
  if (!validTypes.includes(type.toUpperCase() as OTPType)) {
      return res.status(400).json({ error: 'Invalid OTP type.' });
  }
  const otpType = type.toUpperCase() as OTPType;


  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isValid = await verifyOTP(email, otp, type);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    let responseMessage = '';
    let updatedUserData: Partial<User> = {
      otp: null,
      otpExpiresAt: null,
      otpType: null,
    };

    if (otpType === 'REGISTRATION') {
      updatedUserData.isEmailVerified = true;
      responseMessage = 'Email verified successfully. You can now log in.';
    } else if (otpType === 'PASSWORD_RESET') {
      responseMessage = 'OTP verified successfully. You can now reset your password.';
    }

    await prisma.user.update({
      where: { email },
      data: updatedUserData,
    });

    res.json({ message: responseMessage });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Login Endpoint
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials (user not found)' });
    }

    if (!user.isEmailVerified) {
      // Generate a new OTP for email verification if user tries to log in without being verified
      const otp = generateOTP();
      const otpExpiresAt = getOTPExpiry();
      await prisma.user.update({
        where: { email },
        data: { otp, otpExpiresAt, otpType: 'REGISTRATION' },
      });
      // TODO: Send OTP via email/SMS
      console.log(`Login attempt by unverified user ${email}. New OTP sent: ${otp}`);
      return res.status(403).json({ error: 'Email not verified. A new OTP has been sent. Please verify your email first.', otpSent: true, email: user.email });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials (password mismatch)' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Exclude password from the user object returned
    const { password: _p, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Admin Registration Endpoint (requires a secret key)
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

app.post('/auth/register-admin', async (req, res) => {
  const { email, password, name, secretKey } = req.body;

  if (!ADMIN_SECRET_KEY) {
    console.error('ADMIN_SECRET_KEY is not set in .env. Admin registration is disabled.');
    return res.status(500).json({ error: 'Admin registration is currently disabled.' });
  }

  if (secretKey !== ADMIN_SECRET_KEY) {
    return res.status(403).json({ error: 'Invalid secret key for admin registration.' });
  }

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required for admin registration.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const adminUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN', // Directly set role to ADMIN
        isEmailVerified: true, // Admins are auto-verified
      },
    });

    const { password: _, ...userWithoutPassword } = adminUser;
    res.status(201).json(userWithoutPassword);

  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ error: 'Internal server error during admin registration.' });
  }
});

// --- Forgot Password ---
app.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Also check if the user is verified, otherwise they should verify first.
    if (!user.isEmailVerified) {
      // Optionally, resend verification OTP
      const registrationOtp = generateOTP();
      const registrationOtpExpiresAt = getOTPExpiry();

      await prisma.user.update({
        where: { email },
        data: { 
          otp: registrationOtp, 
          otpExpiresAt: registrationOtpExpiresAt, 
          otpType: 'REGISTRATION' 
        },
      });

      await sendOTPEmail(email, registrationOtp, 'REGISTRATION');
      console.log(`Forgot password attempt for unverified email ${email}. Sending REGISTRATION OTP: ${registrationOtp}`);
      return res.status(403).json({ 
        error: 'Email not verified. Please verify your email first.',
        otpSent: true
      });
    }

    // Generate and send password reset OTP
    const otp = generateOTP();
    const otpExpiresAt = getOTPExpiry();

    await prisma.user.update({
      where: { email },
      data: {
        otp,
        otpExpiresAt,
        otpType: 'PASSWORD_RESET',
      },
    });

    await sendOTPEmail(email, otp, 'PASSWORD_RESET');
    console.log(`Password reset OTP sent to ${email}: ${otp}`);

    res.json({ message: 'Password reset OTP sent successfully' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process forgot password request' });
  }
});

// --- Reset Password ---
app.post('/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // We must check for isEmailVerified here too, because user might have requested OTP before verifying.
    if (!user.isEmailVerified) {
      return res.status(403).json({ error: 'Email not verified. Please verify your email first.' });
    }

    const isValid = await verifyOTP(email, otp, 'PASSWORD_RESET');
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Update password and clear OTP
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiresAt: null,
        otpType: null,
      },
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// --- Polls API Endpoints ---

// Create a new Poll (Admin only)
app.post('/polls', authenticateToken, authorizeRole('ADMIN'), async (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const { title, description, options } = authenticatedReq.body;
  const userId = authenticatedReq.user?.userId;

  if (!title || !options || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: 'Title and at least two options are required.' });
  }
  if (!userId) {
    return res.status(403).json({ error: 'User ID not found in token.' });
  }

  try {
    const newPoll = await prisma.poll.create({
      data: {
        title,
        description,
        createdById: userId,
        options: {
          create: options.map((optionText: string) => ({ text: optionText })),
        },
      },
      include: { options: true, createdBy: { select: { id: true, name: true, email: true } } },
    });

    // TODO: Notify users about the new poll - For now, this is a placeholder
    // In a real app, you might target specific user groups or handle this differently.
    // For simplicity, let's assume we might want to notify the creator that their poll was posted.
    if (newPoll.createdBy) {
        await createNotification({
            userId: newPoll.createdById,
            message: `Your poll "${newPoll.title}" has been created successfully.`,
            type: 'POLL_NEW',
            relatedEntityType: 'Poll',
            relatedEntityId: newPoll.id
        });
    }
    // Example: If you wanted to notify all users (requires fetching all user IDs - potentially heavy)
    /*
    const allUsers = await prisma.user.findMany({ select: { id: true } });
    for (const user of allUsers) {
        if (user.id !== newPoll.createdById) { // Don't notify the creator twice here
            await createNotification({
                userId: user.id,
                message: `A new poll "${newPoll.title}" has been posted by ${newPoll.createdBy.name}.`,
                type: 'POLL_NEW',
                relatedEntityType: 'Poll',
                relatedEntityId: newPoll.id
            });
        }
    }
    */

    res.status(201).json(newPoll);
  } catch (error) {
    console.error("Create poll error:", error);
    res.status(500).json({ error: 'Could not create poll.' });
  }
});

// Get all Polls (with options and creator info)
app.get('/polls', async (req: Request, res: Response) => {
  try {
    const polls = await prisma.poll.findMany({
      include: {
        options: true,
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { votes: true } } // Count total votes for each poll
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(polls);
  } catch (error) {
    console.error("Get polls error:", error);
    res.status(500).json({ error: 'Could not retrieve polls.' });
  }
});

// Get a specific Poll (with options, votes, and creator info)
app.get('/polls/:id', async (req: Request, res: Response) => {
  const pollId = parseInt(req.params.id, 10);
  if (isNaN(pollId)) {
    return res.status(400).json({ error: 'Invalid poll ID.'});
  }

  try {
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: {
            _count: { select: { votes: true } } // Count votes for each option
          }
        },
        createdBy: { select: { id: true, name: true, email: true } },
        votes: { // Include individual votes to see who voted for what (optional)
          include: {
            user: { select: { id: true, name: true } }
          }
        }
      },
    });

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found.' });
    }
    res.json(poll);
  } catch (error) {
    console.error(`Get poll ${pollId} error:`, error);
    res.status(500).json({ error: 'Could not retrieve poll.' });
  }
});

// Vote on a Poll
app.post('/polls/:id/vote', authenticateToken, async (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const pollId = parseInt(authenticatedReq.params.id, 10);
  const { optionId } = authenticatedReq.body;
  const userId = authenticatedReq.user?.userId;

  if (isNaN(pollId) || !optionId) {
    return res.status(400).json({ error: 'Poll ID and Option ID are required.' });
  }
  if (!userId) {
    return res.status(403).json({ error: 'User ID not found in token.' });
  }

  try {
    // Check if the option belongs to the poll
    const pollOption = await prisma.pollOption.findFirst({
        where: { id: optionId, pollId: pollId }
    });
    if (!pollOption) {
        return res.status(400).json({ error: 'Invalid option for this poll.' });
    }

    const newVote = await prisma.vote.create({
      data: {
        userId: userId,
        pollId: pollId,
        pollOptionId: optionId,
      },
      include: { pollOption: true, user: {select: { id: true, name: true}}, poll: { select: { createdById: true, title: true }} }
    });

    // Notify poll creator about the new vote
    if (newVote.poll && newVote.poll.createdById !== newVote.userId) { // Check if poll and creator exist, and voter is not creator
      await createNotification({
        userId: newVote.poll.createdById,
        message: `${newVote.user.name} voted on your poll "${newVote.poll.title}".`,
        type: 'POLL_VOTE_RECEIVED',
        relatedEntityType: 'Poll',
        relatedEntityId: newVote.pollId
      });
    }

    res.status(201).json(newVote);
  } catch (error: any) {
    if (error.code === 'P2002') { // Prisma unique constraint violation code
      return res.status(409).json({ error: 'You have already voted on this poll.' });
    }
    console.error(`Vote on poll ${pollId} error:`, error);
    res.status(500).json({ error: 'Could not cast vote.' });
  }
});

// Delete a Poll
app.delete('/polls/:id', authenticateToken, async (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const pollId = parseInt(authenticatedReq.params.id, 10);
  const userId = authenticatedReq.user?.userId;
  const userRole = authenticatedReq.user?.role;

  if (isNaN(pollId)) {
    return res.status(400).json({ error: 'Invalid poll ID.'});
  }
   if (!userId) {
    return res.status(403).json({ error: 'User ID not found in token.' });
  }

  try {
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found.' });
    }

    if (poll.createdById !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'You are not authorized to delete this poll.' });
    }

    await prisma.poll.delete({
      where: { id: pollId },
    });
    res.status(204).send(); // No content
  } catch (error) {
    console.error(`Delete poll ${pollId} error:`, error);
    res.status(500).json({ error: 'Could not delete poll.' });
  }
});

// --- Payment Requests API Endpoints ---

// Create a Payment Request (Admin/Staff only)
app.post('/payment-requests', authenticateToken, authorizeRole('ADMIN'), async (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const { targetUserId, teamId, description, amount, dueDate } = authenticatedReq.body;
  const createdById = authenticatedReq.user?.userId;

  if ((!targetUserId && !teamId) || !description || amount == null || !createdById) {
    return res.status(400).json({ error: 'Either target user or team ID, description, amount, and creator ID are required.' });
  }
  if (parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'Amount must be positive.'});
  }

  try {
    let paymentRequests = [];

    if (teamId) {
      // Get all team members
      const team = await prisma.team.findUnique({
        where: { id: parseInt(teamId) },
        include: {
          members: {
            include: {
              user: true
            }
          }
        }
      });

      if (!team) {
        return res.status(404).json({ error: 'Team not found.' });
      }

      // Create payment requests for each team member
      for (const member of team.members) {
        const newPaymentRequest = await prisma.paymentRequest.create({
          data: {
            targetUserId: member.user.id,
            createdById: createdById,
            description: `${description} (Team: ${team.name})`,
            amount: parseFloat(amount),
            dueDate: dueDate ? new Date(dueDate) : null,
          },
          include: { 
            targetUser: { select: { id: true, name: true, email: true }}, 
            createdBy: { select: { id: true, name: true, email: true }} 
          }
        });

        // Notify team member about the new payment request
        await createNotification({
          userId: member.user.id,
          message: `You have a new team payment request: "${description}" for $${amount}.`,
          type: 'PAYMENT_REQUEST_NEW',
          relatedEntityType: 'PaymentRequest',
          relatedEntityId: newPaymentRequest.id
        });

        paymentRequests.push(newPaymentRequest);
      }

      // Notify team captain about the team payment request
      const teamCaptain = team.members.find(m => m.role === 'CAPTAIN');
      if (teamCaptain) {
        await createNotification({
          userId: teamCaptain.user.id,
          message: `A new payment request has been created for all members of team "${team.name}".`,
          type: 'PAYMENT_REQUEST_NEW',
          relatedEntityType: 'Team',
          relatedEntityId: team.id
        });
      }

      return res.status(201).json({
        message: `Payment requests created for all team members of ${team.name}`,
        paymentRequests
      });
    } else {
      // Handle individual payment request (existing logic)
      const newPaymentRequest = await prisma.paymentRequest.create({
        data: {
          targetUserId: parseInt(targetUserId, 10),
          createdById: createdById,
          description,
          amount: parseFloat(amount),
          dueDate: dueDate ? new Date(dueDate) : null,
        },
        include: { 
          targetUser: { select: { id: true, name: true, email: true }}, 
          createdBy: { select: { id: true, name: true, email: true }} 
        }
      });

      // Notify target user about the new payment request
      await createNotification({
        userId: newPaymentRequest.targetUserId,
        message: `You have a new payment request: "${newPaymentRequest.description}" for $${newPaymentRequest.amount}.`,
        type: 'PAYMENT_REQUEST_NEW',
        relatedEntityType: 'PaymentRequest',
        relatedEntityId: newPaymentRequest.id
      });

      return res.status(201).json(newPaymentRequest);
    }
  } catch (error) {
    console.error("Create payment request error:", error);
    res.status(500).json({ error: 'Could not create payment request.' });
  }
});

// Get Payment Requests for the logged-in user (their own)
app.get('/payment-requests/my', authenticateToken, async (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const userId = authenticatedReq.user?.userId;

  if (!userId) {
    return res.status(403).json({ error: 'User ID not found in token.' });
  }

  try {
    const paymentRequests = await prisma.paymentRequest.findMany({
      where: { targetUserId: userId },
      include: { 
        createdBy: { select: { id: true, name: true } },
        payments: true 
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(paymentRequests);
  } catch (error) {
    console.error("Get my payment requests error:", error);
    res.status(500).json({ error: 'Could not retrieve your payment requests.' });
  }
});

// Get All Payment Requests (Admin/Staff view)
app.get('/payment-requests', authenticateToken, authorizeRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    const paymentRequests = await prisma.paymentRequest.findMany({
      include: {
        targetUser: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        payments: { select: { id: true, amountPaid: true, paymentDate: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(paymentRequests);
  } catch (error) {
    console.error("Get all payment requests error:", error);
    res.status(500).json({ error: 'Could not retrieve payment requests.' });
  }
});

// Update Payment Request Status (Admin/Staff only)
app.put('/payment-requests/:id/status', authenticateToken, authorizeRole('ADMIN'), async (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const paymentRequestId = parseInt(authenticatedReq.params.id, 10);
  const { status } = authenticatedReq.body; // e.g., PAID, OVERDUE, CANCELLED

  if (isNaN(paymentRequestId) || !status) {
    return res.status(400).json({ error: 'Payment Request ID and status are required.' });
  }
  
  const validStatuses = ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'];
  const upperStatus = status.toUpperCase();
  if (!validStatuses.includes(upperStatus)) {
      return res.status(400).json({ error: `Invalid status value. Must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const updatedPaymentRequest = await prisma.paymentRequest.update({
      where: { id: paymentRequestId },
      data: { status: upperStatus as any }, // Cast as any to satisfy Prisma enum type
      include: { targetUser: { select: { id: true, name: true, email: true }} }
    });
    res.json(updatedPaymentRequest);
  } catch (error: any) {
    if (error.code === 'P2025') { // Record to update not found
        return res.status(404).json({ error: 'Payment request not found.' });
    }
    console.error(`Update payment request ${paymentRequestId} status error:`, error);
    res.status(500).json({ error: 'Could not update payment request status.' });
  }
});

// Record a Payment for a Payment Request (Admin/Staff)
app.post('/payment-requests/:id/payments', authenticateToken, authorizeRole('ADMIN'), async (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const paymentRequestId = parseInt(authenticatedReq.params.id, 10);
  const { amountPaid, paymentMethod, transactionId, notes } = authenticatedReq.body;
  const recordedById = authenticatedReq.user?.userId;

  if (isNaN(paymentRequestId) || amountPaid == null || !recordedById) {
    return res.status(400).json({ error: 'Payment Request ID, amount paid, and recorder ID are required.' });
  }
  const parsedAmountPaid = parseFloat(amountPaid);
  if (parsedAmountPaid <= 0) {
      return res.status(400).json({ error: 'Amount paid must be positive.'});
  }

  try {
    const paymentRequest = await prisma.paymentRequest.findUnique({ where: {id: paymentRequestId}});
    if (!paymentRequest) {
        return res.status(404).json({ error: 'Payment request not found.'});
    }

    const newPayment = await prisma.payment.create({
      data: {
        paymentRequestId: paymentRequestId,
        amountPaid: parsedAmountPaid,
        paymentMethod,
        transactionId,
        notes,
        recordedById: recordedById,
      },
      include: { paymentRequest: true, recordedBy: { select: {id: true, name: true}} }
    });
    
    const totalPaidResult = await prisma.payment.aggregate({
        _sum: { amountPaid: true },
        where: { paymentRequestId: paymentRequestId }
    });

    const currentTotalPaid = totalPaidResult._sum.amountPaid || 0;

    if (currentTotalPaid >= paymentRequest.amount) {
        await prisma.paymentRequest.update({
            where: { id: paymentRequestId },
            data: { status: 'PAID' }
        });
    }

    // Notify the target user of the payment request that a payment was recorded
    await createNotification({
        userId: newPayment.paymentRequest.targetUserId,
        message: `A payment of $${newPayment.amountPaid} for "${newPayment.paymentRequest.description}" has been recorded.`,
        type: 'PAYMENT_RECEIVED',
        relatedEntityType: 'PaymentRequest',
        relatedEntityId: newPayment.paymentRequestId
    });
     // Notify the admin who recorded it (optional, could be self-notification if useful)
    if (newPayment.recordedById) {
        await createNotification({
            userId: newPayment.recordedById,
            message: `You successfully recorded a payment of $${newPayment.amountPaid} for "${newPayment.paymentRequest.description}".`,
            type: 'PAYMENT_CONFIRMED', // Or a more admin-specific type
            relatedEntityType: 'Payment',
            relatedEntityId: newPayment.id
        });
    }

    res.status(201).json(newPayment);
  } catch (error: any) {
     if (error.code === 'P2003') { 
        return res.status(400).json({ error: 'Invalid user ID for recording payment or invalid payment request ID.' });
    }
    console.error(`Record payment for request ${paymentRequestId} error:`, error);
    res.status(500).json({ error: 'Could not record payment.' });
  }
});

// Get Payments for a specific Request
app.get('/payment-requests/:id/payments', authenticateToken, async (req: Request, res: Response) => {
    const authenticatedReq = req as AuthenticatedRequest;
    const paymentRequestId = parseInt(authenticatedReq.params.id, 10);
    const requestingUserId = authenticatedReq.user?.userId;
    const requestingUserRole = authenticatedReq.user?.role;

    if (isNaN(paymentRequestId)) {
        return res.status(400).json({ error: 'Invalid Payment Request ID.' });
    }
     if (!requestingUserId) {
        return res.status(403).json({ error: 'User ID not found in token.' });
    }

    try {
        const paymentRequest = await prisma.paymentRequest.findUnique({
            where: { id: paymentRequestId }
        });

        if (!paymentRequest) {
            return res.status(404).json({ error: 'Payment request not found.' });
        }

        if (requestingUserRole !== 'ADMIN' && paymentRequest.targetUserId !== requestingUserId) {
            return res.status(403).json({ error: 'You are not authorized to view these payments.' });
        }

        const payments = await prisma.payment.findMany({
            where: { paymentRequestId: paymentRequestId },
            include: { recordedBy: { select: { id: true, name: true } } },
            orderBy: { paymentDate: 'desc' }
        });
        res.json(payments);
    } catch (error) {
        console.error(`Get payments for request ${paymentRequestId} error:`, error);
        res.status(500).json({ error: 'Could not retrieve payments.' });
    }
});

// --- Notifications API Endpoints ---

// Get notifications for the logged-in user
app.get('/notifications', authenticateToken, async (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const userId = authenticatedReq.user?.userId;

  if (!userId) {
    return res.status(403).json({ error: 'User ID not found in token.' });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: userId },
      orderBy: [
        { isRead: 'asc' }, // Unread first
        { createdAt: 'desc' },
      ],
    });
    res.json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: 'Could not retrieve notifications.' });
  }
});

// Mark a specific notification as read
app.put('/notifications/:id/read', authenticateToken, async (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const notificationId = parseInt(authenticatedReq.params.id, 10);
  const userId = authenticatedReq.user?.userId;

  if (isNaN(notificationId)) {
    return res.status(400).json({ error: 'Invalid notification ID.' });
  }
  if (!userId) {
    return res.status(403).json({ error: 'User ID not found in token.' });
  }

  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found.' });
    }
    if (notification.userId !== userId) {
      return res.status(403).json({ error: 'You can only mark your own notifications as read.' });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    res.json(updatedNotification);
  } catch (error) {
    console.error(`Mark notification ${notificationId} as read error:`, error);
    res.status(500).json({ error: 'Could not mark notification as read.' });
  }
});

// Mark multiple notifications as read (e.g., all unread, or a list of IDs)
app.put('/notifications/mark-read', authenticateToken, async (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const userId = authenticatedReq.user?.userId;
  const { ids, markAllAsRead } = authenticatedReq.body; // ids: string[] or markAllAsRead: boolean

  if (!userId) {
    return res.status(403).json({ error: 'User ID not found in token.' });
  }

  if (!Array.isArray(ids) && typeof markAllAsRead !== 'boolean') {
      return res.status(400).json({ error: 'Provide an array of notification IDs or set markAllAsRead to true.'});
  }

  try {
    let count = 0;
    if (markAllAsRead) {
      const result = await prisma.notification.updateMany({
        where: { userId: userId, isRead: false },
        data: { isRead: true },
      });
      count = result.count;
    } else if (ids && ids.length > 0) {
      const notificationIds = ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      if (notificationIds.length === 0 && ids.length > 0) {
          return res.status(400).json({ error: 'Invalid notification IDs provided.'});
      }
      const result = await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: userId, // Ensure user can only update their own notifications
          isRead: false,
        },
        data: { isRead: true },
      });
      count = result.count;
    }
    res.json({ message: `${count} notification(s) marked as read.` });
  } catch (error) {
    console.error("Mark notifications as read error:", error);
    res.status(500).json({ error: 'Could not mark notifications as read.' });
  }
});

// User Details Endpoint
app.get('/auth/user-details', authenticateToken, async (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const userId = authenticatedReq.user?.userId;

  if (!userId) {
    return res.status(403).json({ error: 'User ID not found in token.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, isEmailVerified: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Could not retrieve user details.' });
  }
});

// Get current user details
app.get('/auth/me', authenticateToken, async (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const userId = authenticatedReq.user?.userId;

  if (!userId) {
    return res.status(403).json({ error: 'User ID not found in token.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isEmailVerified: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Could not retrieve user details.' });
  }
});

// --- Games API Endpoints ---

// Create Game (Admin only)
app.post('/games', authenticateToken, authorizeRole('ADMIN'), async (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const { title, description, maxParticipants, startDate, endDate, location } = authenticatedReq.body;
  const createdById = authenticatedReq.user?.userId;

  if (!title || !description || !maxParticipants || !startDate || !endDate || !createdById) {
    return res.status(400).json({ error: 'All fields are required except location.' });
  }

  try {
    const game = await createGame({
      title,
      description,
      maxParticipants: parseInt(maxParticipants),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      location,
      createdById,
    });

    // Notify all users about new game
    const allUsers = await prisma.user.findMany({
      select: { id: true },
    });

    for (const user of allUsers) {
      await createNotification({
        userId: user.id,
        message: `New game available: ${game.title}`,
        type: 'GENERAL',
        relatedEntityType: 'Game',
        relatedEntityId: game.id,
      });
    }

    res.status(201).json(game);
  } catch (error) {
    console.error("Create game error:", error);
    res.status(500).json({ error: 'Could not create game.' });
  }
});

// Get All Games
app.get('/games', async (req: Request, res: Response) => {
  try {
    const games = await prisma.game.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { startDate: 'asc' },
    });
    res.json(games);
  } catch (error) {
    console.error("Get games error:", error);
    res.status(500).json({ error: 'Could not retrieve games.' });
  }
});

// Register for Game
app.post('/games/:id/register', authenticateToken, async (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const gameId = parseInt(authenticatedReq.params.id);
  const userId = authenticatedReq.user?.userId;

  if (isNaN(gameId) || !userId) {
    return res.status(400).json({ error: 'Invalid game ID or user ID.' });
  }

  try {
    const registration = await registerForGame(gameId, userId);
    res.status(201).json(registration);
  } catch (error: any) {
    console.error(`Register for game ${gameId} error:`, error);
    res.status(400).json({ error: error.message });
  }
});

// Update Game Status (Admin only)
app.put('/games/:id/status', authenticateToken, authorizeRole('ADMIN'), async (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const gameId = parseInt(authenticatedReq.params.id);
  const { status } = authenticatedReq.body;

  if (isNaN(gameId) || !status) {
    return res.status(400).json({ error: 'Game ID and status are required.' });
  }

  const validStatuses = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  try {
    const game = await updateGameStatus(gameId, status as any);
    res.json(game);
  } catch (error: any) {
    console.error(`Update game ${gameId} status error:`, error);
    res.status(400).json({ error: error.message });
  }
});

// Get Game Registrations (Admin only)
app.get('/games/:id/registrations', authenticateToken, authorizeRole('ADMIN'), async (req: Request, res: Response) => {
  const gameId = parseInt(req.params.id);

  if (isNaN(gameId)) {
    return res.status(400).json({ error: 'Invalid game ID.' });
  }

  try {
    const registrations = await prisma.gameRegistration.findMany({
      where: { gameId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(registrations);
  } catch (error) {
    console.error(`Get game ${gameId} registrations error:`, error);
    res.status(500).json({ error: 'Could not retrieve game registrations.' });
  }
});

// --- Announcements API Endpoints ---

// Create Announcement (Admin only)
app.post('/announcements', authenticateToken, authorizeRole('ADMIN'), async (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const { title, content } = authenticatedReq.body;
  const createdById = authenticatedReq.user?.userId;

  if (!title || !content || !createdById) {
    return res.status(400).json({ error: 'Title, content, and creator ID are required.' });
  }

  try {
    console.log(Object.keys(prisma), 'Available Prisma models');
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        createdById,
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

    // Notify all users about new announcement
    const allUsers = await prisma.user.findMany({
      select: { id: true },
    });

    for (const user of allUsers) {
      await createNotification({
        userId: user.id,
        message: `New announcement: ${announcement.title}`,
        type: 'GENERAL',
        relatedEntityType: 'Announcement',
        relatedEntityId: announcement.id,
      });
    }

    res.status(201).json(announcement);
  } catch (error) {
    console.error("Create announcement error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    res.status(500).json({ error: 'Could not create announcement.' });
  }
});

// Get All Announcements
app.get('/announcements', async (req: Request, res: Response) => {
  try {
    const announcements = await prisma.announcement.findMany({
      where: { isActive: true },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return res.json({
      announcements: announcements,
      message: announcements.length === 0 ? 'No active announcements at the moment.' : undefined
    });
    
  } catch (error) {
    console.error("Get announcements error:", error);
    res.status(500).json({ error: 'Could not retrieve announcements.' });
  }
});

// Get all users with filters and sorting
app.get('/users', authenticateToken, authorizeRole('ADMIN'), async (req: Request, res: Response) => {
  const { search, role, status, sortBy, sortOrder } = req.query;
  
  try {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (role && role !== 'ALL') {
      where.role = role;
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy as string] = sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const users = await prisma.user.findMany({
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Could not retrieve users.' });
  }
});

// Update user status
app.put('/users/:id/status', authenticateToken, authorizeRole('ADMIN'), async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const { status } = req.body;

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID.' });
  }

  const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create notification for the user about status change
    await createNotification({
      userId: updatedUser.id,
      message: `Your account status has been updated to ${status}`,
      type: 'STATUS_CHANGE',
      relatedEntityType: 'User',
      relatedEntityId: updatedUser.id,
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Could not update user status.' });
  }
});

// --- Dashboard Stats API Endpoint ---
app.get('/api/dashboard-stats', authenticateToken, authorizeRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    // Total users
    const userCount = await prisma.user.count();

    // Active games (assuming status: 'ONGOING')
    const activeGames = await prisma.game.count({
      where: { status: 'ONGOING' }
    });

    // Total revenue (sum of all payments)
    const revenueAgg = await prisma.payment.aggregate({
      _sum: { amountPaid: true }
    });
    const totalRevenue = revenueAgg._sum.amountPaid || 0;

    // Active sessions (example: users with status ACTIVE)
    const activeSessions = await prisma.user.count({
      where: { status: 'ACTIVE' }
    });

    res.json({
      userCount,
      activeGames,
      totalRevenue,
      activeSessions
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Could not retrieve dashboard stats.' });
  }
});

// Parent Registration Endpoint
app.post('/auth/register-parent', async (req, res) => {
  const { email, password, name, childName, childAge } = req.body;

  if (!email || !password || !childName || !childAge) {
    return res.status(400).json({ error: 'Email, password, child name, and child age are required for parent registration' });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.isEmailVerified) {
      return res.status(409).json({ error: 'User already exists and is verified.' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const otp = generateOTP();
    const otpExpiresAt = getOTPExpiry();

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'PARENT',
        otp,
        otpExpiresAt,
        otpType: 'REGISTRATION',
        isEmailVerified: false,
        // Store child information in the user's metadata
        metadata: {
          childName,
          childAge: parseInt(childAge),
        },
      },
    });

    await sendOTPEmail(email, otp, 'REGISTRATION');

    // Exclude password and OTP details from the initial response
    const { password: _p, otp: _o, otpExpiresAt: _oe, otpType: _ot, ...userForResponse } = newUser;
    res.status(201).json({ 
      message: 'Parent registered. Please verify OTP.', 
      userId: userForResponse.id, 
      email: userForResponse.email, 
      otpSent: true 
    });

  } catch (error) {
    console.error('Parent registration error:', error);
    res.status(500).json({ error: 'Failed to register parent' });
  }
});

// --- Team Management API Endpoints ---

// Create a new team
app.post('/teams', authenticateToken, async (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const { name, description } = authenticatedReq.body;
  const createdById = authenticatedReq.user?.userId;

  if (!name || !createdById) {
    return res.status(400).json({ error: 'Team name and creator ID are required.' });
  }

  try {
    const newTeam = await prisma.team.create({
      data: {
        name,
        description,
        createdById,
        members: {
          create: {
            userId: createdById,
            role: 'CAPTAIN'
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.status(201).json(newTeam);
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Could not create team.' });
  }
});

// Get all teams
app.get('/teams', async (req: Request, res: Response) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    res.json(teams);
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: 'Could not retrieve teams.' });
  }
});

// Get a specific team
app.get('/teams/:id', async (req: Request, res: Response) => {
  const teamId = parseInt(req.params.id);
  
  if (isNaN(teamId)) {
    return res.status(400).json({ error: 'Invalid team ID.' });
  }

  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    res.json(team);
  } catch (error) {
    console.error(`Get team ${teamId} error:`, error);
    res.status(500).json({ error: 'Could not retrieve team.' });
  }
});

// Add member to team
app.post('/teams/:id/members', authenticateToken, async (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const teamId = parseInt(authenticatedReq.params.id);
  const { userId } = authenticatedReq.body;
  const requesterId = authenticatedReq.user?.userId;

  if (isNaN(teamId) || !userId || !requesterId) {
    return res.status(400).json({ error: 'Team ID and user ID are required.' });
  }

  try {
    // Check if requester is team captain
    const requesterMembership = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: requesterId,
        role: 'CAPTAIN'
      }
    });

    if (!requesterMembership) {
      return res.status(403).json({ error: 'Only team captain can add members.' });
    }

    // Check if team is full
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        _count: {
          select: { members: true }
        }
      }
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    if (team._count.members >= team.maxMembers) {
      return res.status(400).json({ error: 'Team has reached maximum member limit.' });
    }

    // Check if user is already a member
    const existingMembership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: parseInt(userId)
        }
      }
    });

    if (existingMembership) {
      return res.status(400).json({ error: 'User is already a member of this team.' });
    }

    // Add new member
    const newMember = await prisma.teamMember.create({
      data: {
        teamId,
        userId: parseInt(userId),
        role: 'MEMBER'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Notify the new member
    await createNotification({
      userId: parseInt(userId),
      message: `You have been added to team "${team.name}"`,
      type: 'GENERAL',
      relatedEntityType: 'Team',
      relatedEntityId: teamId
    });

    res.status(201).json(newMember);
  } catch (error) {
    console.error(`Add member to team ${teamId} error:`, error);
    res.status(500).json({ error: 'Could not add member to team.' });
  }
});

// Remove member from team
app.delete('/teams/:id/members/:userId', authenticateToken, async (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const teamId = parseInt(authenticatedReq.params.id);
  const userId = parseInt(authenticatedReq.params.userId);
  const requesterId = authenticatedReq.user?.userId;

  if (isNaN(teamId) || isNaN(userId) || !requesterId) {
    return res.status(400).json({ error: 'Team ID and user ID are required.' });
  }

  try {
    // Check if requester is team captain
    const requesterMembership = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: requesterId,
        role: 'CAPTAIN'
      }
    });

    if (!requesterMembership) {
      return res.status(403).json({ error: 'Only team captain can remove members.' });
    }

    // Check if trying to remove the captain
    const targetMembership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId
        }
      }
    });

    if (!targetMembership) {
      return res.status(404).json({ error: 'Member not found in team.' });
    }

    if (targetMembership.role === 'CAPTAIN') {
      return res.status(400).json({ error: 'Cannot remove team captain.' });
    }

    // Remove member
    await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId
        }
      }
    });

    // Notify the removed member
    await createNotification({
      userId,
      message: `You have been removed from team "${(await prisma.team.findUnique({ where: { id: teamId } }))?.name}"`,
      type: 'GENERAL',
      relatedEntityType: 'Team',
      relatedEntityId: teamId
    });

    res.status(204).send();
  } catch (error) {
    console.error(`Remove member from team ${teamId} error:`, error);
    res.status(500).json({ error: 'Could not remove member from team.' });
  }
});

// Get user's teams
app.get('/teams/my', authenticateToken, async (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const userId = authenticatedReq.user?.userId;

  if (!userId) {
    return res.status(403).json({ error: 'User ID not found in token.' });
  }

  try {
    const userTeams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    res.json(userTeams);
  } catch (error) {
    console.error('Get user teams error:', error);
    res.status(500).json({ error: 'Could not retrieve user teams.' });
  }
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
});
