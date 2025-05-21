var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var import_express = __toESM(require("express"));
var import_bcryptjs = __toESM(require("bcryptjs"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_db = require("./db");
var import_authMiddleware = require("./authMiddleware");
var import_notificationService = require("./notificationService");
var import_otpService = require("./services/otpService");
var import_cors = __toESM(require("cors"));
const JWT_SECRET = process.env.JWT_SECRET || "your-very-secure-secret-key";
const SALT_ROUNDS = 10;
const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 3e3;
const app = (0, import_express.default)();
app.use(import_express.default.json());
app.use((0, import_cors.default)());
app.get("/", (req, res) => {
  res.send({ message: "Hello API" });
});
app.post("/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const existingUser = await import_db.prisma.user.findUnique({
      where: { email }
    });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(409).json({ error: "User already exists and is verified." });
    }
    if (existingUser && !existingUser.isEmailVerified) {
      const otp2 = (0, import_otpService.generateOTP)();
      const otpExpiresAt2 = (0, import_otpService.getOTPExpiry)();
      const updatedUser = await import_db.prisma.user.update({
        where: { email },
        data: {
          name,
          // Allow updating name if they retry registration
          password: await import_bcryptjs.default.hash(password, SALT_ROUNDS),
          // Allow updating password
          otp: otp2,
          otpExpiresAt: otpExpiresAt2,
          otpType: "REGISTRATION"
        }
      });
      await (0, import_otpService.sendOTPEmail)(email, otp2, "REGISTRATION");
      return res.status(200).json({ message: "OTP resent successfully." });
    }
    const hashedPassword = await import_bcryptjs.default.hash(password, SALT_ROUNDS);
    const otp = (0, import_otpService.generateOTP)();
    const otpExpiresAt = (0, import_otpService.getOTPExpiry)();
    const newUser = await import_db.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        otp,
        otpExpiresAt,
        otpType: "REGISTRATION",
        isEmailVerified: false
        // Explicitly false until OTP verification
      }
    });
    await (0, import_otpService.sendOTPEmail)(email, otp, "REGISTRATION");
    const { password: _p, otp: _o, otpExpiresAt: _oe, otpType: _ot, ...userForResponse } = newUser;
    res.status(201).json({ message: "User registered. Please verify OTP.", userId: userForResponse.id, email: userForResponse.email, otpSent: true });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});
app.post("/auth/verify-otp", async (req, res) => {
  const { email, otp, type } = req.body;
  if (!email || !otp || !type) {
    return res.status(400).json({ error: "Email, OTP, and type are required." });
  }
  const validTypes = ["REGISTRATION", "PASSWORD_RESET"];
  if (!validTypes.includes(type.toUpperCase())) {
    return res.status(400).json({ error: "Invalid OTP type." });
  }
  const otpType = type.toUpperCase();
  try {
    const user = await import_db.prisma.user.findUnique({
      where: { email }
    });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    const isValid = await (0, import_otpService.verifyOTP)(email, otp, type);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    let responseMessage = "";
    let updatedUserData = {
      otp: null,
      otpExpiresAt: null,
      otpType: null
    };
    if (otpType === "REGISTRATION") {
      updatedUserData.isEmailVerified = true;
      responseMessage = "Email verified successfully. You can now log in.";
    } else if (otpType === "PASSWORD_RESET") {
      responseMessage = "OTP verified successfully. You can now reset your password.";
    }
    await import_db.prisma.user.update({
      where: { email },
      data: updatedUserData
    });
    res.json({ message: responseMessage });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(400).json({ error: error.message });
  }
});
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const user = await import_db.prisma.user.findUnique({
      where: { email }
    });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials (user not found)" });
    }
    if (!user.isEmailVerified) {
      const otp = (0, import_otpService.generateOTP)();
      const otpExpiresAt = (0, import_otpService.getOTPExpiry)();
      await import_db.prisma.user.update({
        where: { email },
        data: { otp, otpExpiresAt, otpType: "REGISTRATION" }
      });
      console.log(`Login attempt by unverified user ${email}. New OTP sent: ${otp}`);
      return res.status(403).json({ error: "Email not verified. A new OTP has been sent. Please verify your email first.", otpSent: true, email: user.email });
    }
    const isPasswordValid = await import_bcryptjs.default.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials (password mismatch)" });
    }
    const token = import_jsonwebtoken.default.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
      // Token expires in 1 hour
    );
    const { password: _p, ...userWithoutPassword } = user;
    res.json({
      message: "Login successful",
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error during login" });
  }
});
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;
app.post("/auth/register-admin", async (req, res) => {
  const { email, password, name, secretKey } = req.body;
  if (!ADMIN_SECRET_KEY) {
    console.error("ADMIN_SECRET_KEY is not set in .env. Admin registration is disabled.");
    return res.status(500).json({ error: "Admin registration is currently disabled." });
  }
  if (secretKey !== ADMIN_SECRET_KEY) {
    return res.status(403).json({ error: "Invalid secret key for admin registration." });
  }
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required for admin registration." });
  }
  try {
    const existingUser = await import_db.prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists." });
    }
    const hashedPassword = await import_bcryptjs.default.hash(password, SALT_ROUNDS);
    const adminUser = await import_db.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "ADMIN",
        // Directly set role to ADMIN
        isEmailVerified: true
        // Admins are auto-verified
      }
    });
    const { password: _, ...userWithoutPassword } = adminUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Admin registration error:", error);
    res.status(500).json({ error: "Internal server error during admin registration." });
  }
});
app.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await import_db.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!user.isEmailVerified) {
      const registrationOtp = (0, import_otpService.generateOTP)();
      const registrationOtpExpiresAt = (0, import_otpService.getOTPExpiry)();
      await import_db.prisma.user.update({
        where: { email },
        data: {
          otp: registrationOtp,
          otpExpiresAt: registrationOtpExpiresAt,
          otpType: "REGISTRATION"
        }
      });
      await (0, import_otpService.sendOTPEmail)(email, registrationOtp, "REGISTRATION");
      console.log(`Forgot password attempt for unverified email ${email}. Sending REGISTRATION OTP: ${registrationOtp}`);
      return res.status(403).json({
        error: "Email not verified. Please verify your email first.",
        otpSent: true
      });
    }
    const otp = (0, import_otpService.generateOTP)();
    const otpExpiresAt = (0, import_otpService.getOTPExpiry)();
    await import_db.prisma.user.update({
      where: { email },
      data: {
        otp,
        otpExpiresAt,
        otpType: "PASSWORD_RESET"
      }
    });
    await (0, import_otpService.sendOTPEmail)(email, otp, "PASSWORD_RESET");
    console.log(`Password reset OTP sent to ${email}: ${otp}`);
    res.json({ message: "Password reset OTP sent successfully" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to process forgot password request" });
  }
});
app.post("/auth/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await import_db.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!user.isEmailVerified) {
      return res.status(403).json({ error: "Email not verified. Please verify your email first." });
    }
    const isValid = await (0, import_otpService.verifyOTP)(email, otp, "PASSWORD_RESET");
    if (!isValid) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    const hashedPassword = await import_bcryptjs.default.hash(newPassword, SALT_ROUNDS);
    await import_db.prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiresAt: null,
        otpType: null
      }
    });
    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});
app.post("/polls", import_authMiddleware.authenticateToken, (0, import_authMiddleware.authorizeRole)("ADMIN"), async (req, res) => {
  const authenticatedReq = req;
  const { title, description, options } = authenticatedReq.body;
  const userId = authenticatedReq.user?.userId;
  if (!title || !options || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: "Title and at least two options are required." });
  }
  if (!userId) {
    return res.status(403).json({ error: "User ID not found in token." });
  }
  try {
    const newPoll = await import_db.prisma.poll.create({
      data: {
        title,
        description,
        createdById: userId,
        options: {
          create: options.map((optionText) => ({ text: optionText }))
        }
      },
      include: { options: true, createdBy: { select: { id: true, name: true, email: true } } }
    });
    if (newPoll.createdBy) {
      await (0, import_notificationService.createNotification)({
        userId: newPoll.createdById,
        message: `Your poll "${newPoll.title}" has been created successfully.`,
        type: "POLL_NEW",
        relatedEntityType: "Poll",
        relatedEntityId: newPoll.id
      });
    }
    res.status(201).json(newPoll);
  } catch (error) {
    console.error("Create poll error:", error);
    res.status(500).json({ error: "Could not create poll." });
  }
});
app.get("/polls", async (req, res) => {
  try {
    const polls = await import_db.prisma.poll.findMany({
      include: {
        options: true,
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { votes: true } }
        // Count total votes for each poll
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(polls);
  } catch (error) {
    console.error("Get polls error:", error);
    res.status(500).json({ error: "Could not retrieve polls." });
  }
});
app.get("/polls/:id", async (req, res) => {
  const pollId = parseInt(req.params.id, 10);
  if (isNaN(pollId)) {
    return res.status(400).json({ error: "Invalid poll ID." });
  }
  try {
    const poll = await import_db.prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: {
            _count: { select: { votes: true } }
            // Count votes for each option
          }
        },
        createdBy: { select: { id: true, name: true, email: true } },
        votes: {
          // Include individual votes to see who voted for what (optional)
          include: {
            user: { select: { id: true, name: true } }
          }
        }
      }
    });
    if (!poll) {
      return res.status(404).json({ error: "Poll not found." });
    }
    res.json(poll);
  } catch (error) {
    console.error(`Get poll ${pollId} error:`, error);
    res.status(500).json({ error: "Could not retrieve poll." });
  }
});
app.post("/polls/:id/vote", import_authMiddleware.authenticateToken, async (req, res) => {
  const authenticatedReq = req;
  const pollId = parseInt(authenticatedReq.params.id, 10);
  const { optionId } = authenticatedReq.body;
  const userId = authenticatedReq.user?.userId;
  if (isNaN(pollId) || !optionId) {
    return res.status(400).json({ error: "Poll ID and Option ID are required." });
  }
  if (!userId) {
    return res.status(403).json({ error: "User ID not found in token." });
  }
  try {
    const pollOption = await import_db.prisma.pollOption.findFirst({
      where: { id: optionId, pollId }
    });
    if (!pollOption) {
      return res.status(400).json({ error: "Invalid option for this poll." });
    }
    const newVote = await import_db.prisma.vote.create({
      data: {
        userId,
        pollId,
        pollOptionId: optionId
      },
      include: { pollOption: true, user: { select: { id: true, name: true } }, poll: { select: { createdById: true, title: true } } }
    });
    if (newVote.poll && newVote.poll.createdById !== newVote.userId) {
      await (0, import_notificationService.createNotification)({
        userId: newVote.poll.createdById,
        message: `${newVote.user.name} voted on your poll "${newVote.poll.title}".`,
        type: "POLL_VOTE_RECEIVED",
        relatedEntityType: "Poll",
        relatedEntityId: newVote.pollId
      });
    }
    res.status(201).json(newVote);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "You have already voted on this poll." });
    }
    console.error(`Vote on poll ${pollId} error:`, error);
    res.status(500).json({ error: "Could not cast vote." });
  }
});
app.delete("/polls/:id", import_authMiddleware.authenticateToken, async (req, res) => {
  const authenticatedReq = req;
  const pollId = parseInt(authenticatedReq.params.id, 10);
  const userId = authenticatedReq.user?.userId;
  const userRole = authenticatedReq.user?.role;
  if (isNaN(pollId)) {
    return res.status(400).json({ error: "Invalid poll ID." });
  }
  if (!userId) {
    return res.status(403).json({ error: "User ID not found in token." });
  }
  try {
    const poll = await import_db.prisma.poll.findUnique({
      where: { id: pollId }
    });
    if (!poll) {
      return res.status(404).json({ error: "Poll not found." });
    }
    if (poll.createdById !== userId && userRole !== "ADMIN") {
      return res.status(403).json({ error: "You are not authorized to delete this poll." });
    }
    await import_db.prisma.poll.delete({
      where: { id: pollId }
    });
    res.status(204).send();
  } catch (error) {
    console.error(`Delete poll ${pollId} error:`, error);
    res.status(500).json({ error: "Could not delete poll." });
  }
});
app.post("/payment-requests", import_authMiddleware.authenticateToken, (0, import_authMiddleware.authorizeRole)("ADMIN"), async (req, res) => {
  const authenticatedReq = req;
  const { targetUserId, description, amount, dueDate } = authenticatedReq.body;
  const createdById = authenticatedReq.user?.userId;
  if (!targetUserId || !description || amount == null || !createdById) {
    return res.status(400).json({ error: "Target user, description, amount, and creator ID are required." });
  }
  if (parseFloat(amount) <= 0) {
    return res.status(400).json({ error: "Amount must be positive." });
  }
  try {
    const newPaymentRequest = await import_db.prisma.paymentRequest.create({
      data: {
        targetUserId: parseInt(targetUserId, 10),
        createdById,
        description,
        amount: parseFloat(amount),
        dueDate: dueDate ? new Date(dueDate) : null
        // status: 'PENDING', // Default from schema
      },
      include: { targetUser: { select: { id: true, name: true, email: true } }, createdBy: { select: { id: true, name: true, email: true } } }
    });
    await (0, import_notificationService.createNotification)({
      userId: newPaymentRequest.targetUserId,
      message: `You have a new payment request: "${newPaymentRequest.description}" for $${newPaymentRequest.amount}.`,
      type: "PAYMENT_REQUEST_NEW",
      relatedEntityType: "PaymentRequest",
      relatedEntityId: newPaymentRequest.id
    });
    res.status(201).json(newPaymentRequest);
  } catch (error) {
    console.error("Create payment request error:", error);
    res.status(500).json({ error: "Could not create payment request." });
  }
});
app.get("/payment-requests/my", import_authMiddleware.authenticateToken, async (req, res) => {
  const authenticatedReq = req;
  const userId = authenticatedReq.user?.userId;
  if (!userId) {
    return res.status(403).json({ error: "User ID not found in token." });
  }
  try {
    const paymentRequests = await import_db.prisma.paymentRequest.findMany({
      where: { targetUserId: userId },
      include: {
        createdBy: { select: { id: true, name: true } },
        payments: true
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(paymentRequests);
  } catch (error) {
    console.error("Get my payment requests error:", error);
    res.status(500).json({ error: "Could not retrieve your payment requests." });
  }
});
app.get("/payment-requests", import_authMiddleware.authenticateToken, (0, import_authMiddleware.authorizeRole)("ADMIN"), async (req, res) => {
  try {
    const paymentRequests = await import_db.prisma.paymentRequest.findMany({
      include: {
        targetUser: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        payments: { select: { id: true, amountPaid: true, paymentDate: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(paymentRequests);
  } catch (error) {
    console.error("Get all payment requests error:", error);
    res.status(500).json({ error: "Could not retrieve payment requests." });
  }
});
app.put("/payment-requests/:id/status", import_authMiddleware.authenticateToken, (0, import_authMiddleware.authorizeRole)("ADMIN"), async (req, res) => {
  const authenticatedReq = req;
  const paymentRequestId = parseInt(authenticatedReq.params.id, 10);
  const { status } = authenticatedReq.body;
  if (isNaN(paymentRequestId) || !status) {
    return res.status(400).json({ error: "Payment Request ID and status are required." });
  }
  const validStatuses = ["PENDING", "PAID", "OVERDUE", "CANCELLED"];
  const upperStatus = status.toUpperCase();
  if (!validStatuses.includes(upperStatus)) {
    return res.status(400).json({ error: `Invalid status value. Must be one of: ${validStatuses.join(", ")}` });
  }
  try {
    const updatedPaymentRequest = await import_db.prisma.paymentRequest.update({
      where: { id: paymentRequestId },
      data: { status: upperStatus },
      // Cast as any to satisfy Prisma enum type
      include: { targetUser: { select: { id: true, name: true, email: true } } }
    });
    res.json(updatedPaymentRequest);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Payment request not found." });
    }
    console.error(`Update payment request ${paymentRequestId} status error:`, error);
    res.status(500).json({ error: "Could not update payment request status." });
  }
});
app.post("/payment-requests/:id/payments", import_authMiddleware.authenticateToken, (0, import_authMiddleware.authorizeRole)("ADMIN"), async (req, res) => {
  const authenticatedReq = req;
  const paymentRequestId = parseInt(authenticatedReq.params.id, 10);
  const { amountPaid, paymentMethod, transactionId, notes } = authenticatedReq.body;
  const recordedById = authenticatedReq.user?.userId;
  if (isNaN(paymentRequestId) || amountPaid == null || !recordedById) {
    return res.status(400).json({ error: "Payment Request ID, amount paid, and recorder ID are required." });
  }
  const parsedAmountPaid = parseFloat(amountPaid);
  if (parsedAmountPaid <= 0) {
    return res.status(400).json({ error: "Amount paid must be positive." });
  }
  try {
    const paymentRequest = await import_db.prisma.paymentRequest.findUnique({ where: { id: paymentRequestId } });
    if (!paymentRequest) {
      return res.status(404).json({ error: "Payment request not found." });
    }
    const newPayment = await import_db.prisma.payment.create({
      data: {
        paymentRequestId,
        amountPaid: parsedAmountPaid,
        paymentMethod,
        transactionId,
        notes,
        recordedById
      },
      include: { paymentRequest: true, recordedBy: { select: { id: true, name: true } } }
    });
    const totalPaidResult = await import_db.prisma.payment.aggregate({
      _sum: { amountPaid: true },
      where: { paymentRequestId }
    });
    const currentTotalPaid = totalPaidResult._sum.amountPaid || 0;
    if (currentTotalPaid >= paymentRequest.amount) {
      await import_db.prisma.paymentRequest.update({
        where: { id: paymentRequestId },
        data: { status: "PAID" }
      });
    }
    await (0, import_notificationService.createNotification)({
      userId: newPayment.paymentRequest.targetUserId,
      message: `A payment of $${newPayment.amountPaid} for "${newPayment.paymentRequest.description}" has been recorded.`,
      type: "PAYMENT_RECEIVED",
      relatedEntityType: "PaymentRequest",
      relatedEntityId: newPayment.paymentRequestId
    });
    if (newPayment.recordedById) {
      await (0, import_notificationService.createNotification)({
        userId: newPayment.recordedById,
        message: `You successfully recorded a payment of $${newPayment.amountPaid} for "${newPayment.paymentRequest.description}".`,
        type: "PAYMENT_CONFIRMED",
        // Or a more admin-specific type
        relatedEntityType: "Payment",
        relatedEntityId: newPayment.id
      });
    }
    res.status(201).json(newPayment);
  } catch (error) {
    if (error.code === "P2003") {
      return res.status(400).json({ error: "Invalid user ID for recording payment or invalid payment request ID." });
    }
    console.error(`Record payment for request ${paymentRequestId} error:`, error);
    res.status(500).json({ error: "Could not record payment." });
  }
});
app.get("/payment-requests/:id/payments", import_authMiddleware.authenticateToken, async (req, res) => {
  const authenticatedReq = req;
  const paymentRequestId = parseInt(authenticatedReq.params.id, 10);
  const requestingUserId = authenticatedReq.user?.userId;
  const requestingUserRole = authenticatedReq.user?.role;
  if (isNaN(paymentRequestId)) {
    return res.status(400).json({ error: "Invalid Payment Request ID." });
  }
  if (!requestingUserId) {
    return res.status(403).json({ error: "User ID not found in token." });
  }
  try {
    const paymentRequest = await import_db.prisma.paymentRequest.findUnique({
      where: { id: paymentRequestId }
    });
    if (!paymentRequest) {
      return res.status(404).json({ error: "Payment request not found." });
    }
    if (requestingUserRole !== "ADMIN" && paymentRequest.targetUserId !== requestingUserId) {
      return res.status(403).json({ error: "You are not authorized to view these payments." });
    }
    const payments = await import_db.prisma.payment.findMany({
      where: { paymentRequestId },
      include: { recordedBy: { select: { id: true, name: true } } },
      orderBy: { paymentDate: "desc" }
    });
    res.json(payments);
  } catch (error) {
    console.error(`Get payments for request ${paymentRequestId} error:`, error);
    res.status(500).json({ error: "Could not retrieve payments." });
  }
});
app.get("/notifications", import_authMiddleware.authenticateToken, async (req, res) => {
  const authenticatedReq = req;
  const userId = authenticatedReq.user?.userId;
  if (!userId) {
    return res.status(403).json({ error: "User ID not found in token." });
  }
  try {
    const notifications = await import_db.prisma.notification.findMany({
      where: { userId },
      orderBy: [
        { isRead: "asc" },
        // Unread first
        { createdAt: "desc" }
      ]
    });
    res.json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Could not retrieve notifications." });
  }
});
app.put("/notifications/:id/read", import_authMiddleware.authenticateToken, async (req, res) => {
  const authenticatedReq = req;
  const notificationId = parseInt(authenticatedReq.params.id, 10);
  const userId = authenticatedReq.user?.userId;
  if (isNaN(notificationId)) {
    return res.status(400).json({ error: "Invalid notification ID." });
  }
  if (!userId) {
    return res.status(403).json({ error: "User ID not found in token." });
  }
  try {
    const notification = await import_db.prisma.notification.findUnique({
      where: { id: notificationId }
    });
    if (!notification) {
      return res.status(404).json({ error: "Notification not found." });
    }
    if (notification.userId !== userId) {
      return res.status(403).json({ error: "You can only mark your own notifications as read." });
    }
    const updatedNotification = await import_db.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });
    res.json(updatedNotification);
  } catch (error) {
    console.error(`Mark notification ${notificationId} as read error:`, error);
    res.status(500).json({ error: "Could not mark notification as read." });
  }
});
app.put("/notifications/mark-read", import_authMiddleware.authenticateToken, async (req, res) => {
  const authenticatedReq = req;
  const userId = authenticatedReq.user?.userId;
  const { ids, markAllAsRead } = authenticatedReq.body;
  if (!userId) {
    return res.status(403).json({ error: "User ID not found in token." });
  }
  if (!Array.isArray(ids) && typeof markAllAsRead !== "boolean") {
    return res.status(400).json({ error: "Provide an array of notification IDs or set markAllAsRead to true." });
  }
  try {
    let count = 0;
    if (markAllAsRead) {
      const result = await import_db.prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      });
      count = result.count;
    } else if (ids && ids.length > 0) {
      const notificationIds = ids.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
      if (notificationIds.length === 0 && ids.length > 0) {
        return res.status(400).json({ error: "Invalid notification IDs provided." });
      }
      const result = await import_db.prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId,
          // Ensure user can only update their own notifications
          isRead: false
        },
        data: { isRead: true }
      });
      count = result.count;
    }
    res.json({ message: `${count} notification(s) marked as read.` });
  } catch (error) {
    console.error("Mark notifications as read error:", error);
    res.status(500).json({ error: "Could not mark notifications as read." });
  }
});
app.get("/auth/user-details", import_authMiddleware.authenticateToken, async (req, res) => {
  const authenticatedReq = req;
  const userId = authenticatedReq.user?.userId;
  if (!userId) {
    return res.status(403).json({ error: "User ID not found in token." });
  }
  try {
    const user = await import_db.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, isEmailVerified: true }
    });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json(user);
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({ error: "Could not retrieve user details." });
  }
});
app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
//# sourceMappingURL=main.js.map
