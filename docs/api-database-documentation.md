# API and Database Documentation

## API Documentation

### Authentication Endpoints

#### 1. Register User
```http
POST /auth/register
```
**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "name": "string (optional)"
}
```
**Response:**
```json
{
  "message": "User registered. Please verify OTP.",
  "userId": "number",
  "email": "string",
  "otpSent": true
}
```

#### 2. Verify OTP
```http
POST /auth/verify-otp
```
**Request Body:**
```json
{
  "email": "string",
  "otp": "string",
  "type": "REGISTRATION | PASSWORD_RESET"
}
```

#### 3. Login
```http
POST /auth/login
```
**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "message": "Login successful",
  "token": "string (JWT)",
  "user": {
    "id": "number",
    "email": "string",
    "name": "string",
    "role": "USER | ADMIN"
  }
}
```

#### 4. Forgot Password
```http
POST /auth/forgot-password
```
**Request Body:**
```json
{
  "email": "string"
}
```

#### 5. Reset Password
```http
POST /auth/reset-password
```
**Request Body:**
```json
{
  "email": "string",
  "otp": "string",
  "newPassword": "string"
}
```

### Poll Endpoints

#### 1. Create Poll (Admin Only)
```http
POST /polls
```
**Headers:**
```
Authorization: Bearer <token>
```
**Request Body:**
```json
{
  "title": "string",
  "description": "string (optional)",
  "options": ["string"]
}
```

#### 2. Get All Polls
```http
GET /polls
```
**Response:**
```json
[
  {
    "id": "number",
    "title": "string",
    "description": "string",
    "createdAt": "datetime",
    "options": [
      {
        "id": "number",
        "text": "string",
        "_count": { "votes": "number" }
      }
    ],
    "createdBy": {
      "id": "number",
      "name": "string",
      "email": "string"
    }
  }
]
```

#### 3. Vote on Poll
```http
POST /polls/:id/vote
```
**Headers:**
```
Authorization: Bearer <token>
```
**Request Body:**
```json
{
  "optionId": "number"
}
```

### Payment Endpoints

#### 1. Create Payment Request (Admin Only)
```http
POST /payment-requests
```
**Headers:**
```
Authorization: Bearer <token>
```
**Request Body:**
```json
{
  "targetUserId": "number",
  "description": "string",
  "amount": "number",
  "dueDate": "datetime (optional)"
}
```

#### 2. Get User's Payment Requests
```http
GET /payment-requests/my
```
**Headers:**
```
Authorization: Bearer <token>
```

#### 3. Record Payment (Admin Only)
```http
POST /payment-requests/:id/payments
```
**Headers:**
```
Authorization: Bearer <token>
```
**Request Body:**
```json
{
  "amountPaid": "number",
  "paymentMethod": "string",
  "transactionId": "string (optional)",
  "notes": "string (optional)"
}
```

### Notification Endpoints

#### 1. Get User Notifications
```http
GET /notifications
```
**Headers:**
```
Authorization: Bearer <token>
```

#### 2. Mark Notification as Read
```http
PUT /notifications/:id/read
```
**Headers:**
```
Authorization: Bearer <token>
```

#### 3. Mark Multiple Notifications as Read
```http
PUT /notifications/mark-read
```
**Headers:**
```
Authorization: Bearer <token>
```
**Request Body:**
```json
{
  "ids": ["number"] | "markAllAsRead": true
}
```

### Announcement Endpoints

#### 1. Create Announcement (Admin Only)
```http
POST /announcements
```
**Headers:**
```
Authorization: Bearer <token>
```
**Request Body:**
```json
{
  "title": "string",
  "content": "string"
}
```

#### 2. Get All Announcements
```http
GET /announcements
```
**Response:**
```json
[
  {
    "id": "number",
    "title": "string",
    "content": "string",
    "createdAt": "datetime",
    "isActive": "boolean",
    "createdBy": {
      "id": "number",
      "name": "string"
    }
  }
]
```

### Game Endpoints

#### 1. Create Game (Admin Only)
```http
POST /games
```
**Headers:**
```
Authorization: Bearer <token>
```
**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "maxParticipants": "number",
  "startDate": "datetime",
  "endDate": "datetime",
  "location": "string (optional)"
}
```

#### 2. Get All Games
```http
GET /games
```
**Response:**
```json
[
  {
    "id": "number",
    "title": "string",
    "description": "string",
    "maxParticipants": "number",
    "startDate": "datetime",
    "endDate": "datetime",
    "location": "string",
    "status": "UPCOMING | ONGOING | COMPLETED | CANCELLED",
    "createdBy": {
      "id": "number",
      "name": "string"
    },
    "_count": {
      "registrations": "number"
    }
  }
]
```

#### 3. Register for Game
```http
POST /games/:id/register
```
**Headers:**
```
Authorization: Bearer <token>
```

#### 4. Update Game Status (Admin Only)
```http
PUT /games/:id/status
```
**Headers:**
```
Authorization: Bearer <token>
```
**Request Body:**
```json
{
  "status": "UPCOMING | ONGOING | COMPLETED | CANCELLED"
}
```

#### 5. Get Game Registrations (Admin Only)
```http
GET /games/:id/registrations
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
[
  {
    "id": "number",
    "status": "REGISTERED | CANCELLED | ATTENDED | NO_SHOW",
    "createdAt": "datetime",
    "user": {
      "id": "number",
      "name": "string",
      "email": "string"
    }
  }
]
```

## Database Design

### User Management
```prisma
model User {
  id              Int       @id @default(autoincrement())
  email           String    @unique
  name            String?
  password        String
  role            Role      @default(USER)
  isEmailVerified Boolean   @default(false)
  otp             String?
  otpExpiresAt    DateTime?
  otpType         OTPType?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  createdPolls    Poll[]
  votes           Vote[]
  createdPaymentRequests    PaymentRequest[]
  targetedPaymentRequests   PaymentRequest[]
  recordedPayments          Payment[]
  notifications   Notification[]
}

enum Role {
  USER
  ADMIN
}

enum OTPType {
  REGISTRATION
  PASSWORD_RESET
}
```

### Polling System
```prisma
model Poll {
  id          Int          @id @default(autoincrement())
  title       String
  description String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  createdById Int
  createdBy   User         @relation("UserPolls")
  options     PollOption[]
  votes       Vote[]
}

model PollOption {
  id     Int    @id @default(autoincrement())
  text   String
  pollId Int
  poll   Poll   @relation(fields: [pollId], references: [id])
  votes  Vote[]
}

model Vote {
  id           Int        @id @default(autoincrement())
  userId       Int
  user         User       @relation("UserVotes")
  pollId       Int
  poll         Poll       @relation(fields: [pollId], references: [id])
  pollOptionId Int
  pollOption   PollOption @relation(fields: [pollOptionId], references: [id])
  createdAt    DateTime   @default(now())

  @@unique([userId, pollId])
}
```

### Payment System
```prisma
model PaymentRequest {
  id             Int                  @id @default(autoincrement())
  description    String
  amount         Float
  dueDate        DateTime?
  status         PaymentRequestStatus @default(PENDING)
  createdAt      DateTime             @default(now())
  updatedAt      DateTime             @updatedAt
  createdById    Int
  createdBy      User                 @relation("UserCreatedPaymentRequests")
  targetUserId   Int
  targetUser     User                 @relation("UserTargetedPaymentRequests")
  payments       Payment[]
}

model Payment {
  id                Int      @id @default(autoincrement())
  amountPaid        Float
  paymentDate       DateTime @default(now())
  paymentMethod     String?
  transactionId     String?  @unique
  notes             String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  paymentRequestId  Int
  paymentRequest    PaymentRequest
  recordedById      Int?
  recordedBy        User?    @relation("UserRecordedPayments")
}

enum PaymentRequestStatus {
  PENDING
  PAID
  OVERDUE
  CANCELLED
}
```

### Notification System
```prisma
model Notification {
  id                Int              @id @default(autoincrement())
  userId            Int
  user              User             @relation("UserNotifications")
  message           String
  isRead            Boolean          @default(false)
  type              NotificationType @default(GENERAL)
  relatedEntityType String?
  relatedEntityId   Int?
  createdAt         DateTime         @default(now())

  @@index([userId, isRead])
}

enum NotificationType {
  GENERAL
  POLL_NEW
  POLL_VOTE_RECEIVED
  PAYMENT_REQUEST_NEW
  PAYMENT_REQUEST_DUE
  PAYMENT_RECEIVED
  PAYMENT_CONFIRMED
  GAME_REGISTRATION
  GAME_STATUS_CHANGE
}
```

### Announcement System
```prisma
model Announcement {
  id          Int       @id @default(autoincrement())
  title       String
  content     String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  createdById Int
  createdBy   User      @relation("UserCreatedAnnouncements", fields: [createdById], references: [id])
  isActive    Boolean   @default(true)
}
```

### Game System
```prisma
model Game {
  id              Int       @id @default(autoincrement())
  title           String
  description     String
  maxParticipants Int
  startDate       DateTime
  endDate         DateTime
  location        String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdById     Int
  createdBy       User      @relation("UserCreatedGames", fields: [createdById], references: [id])
  status          GameStatus @default(UPCOMING)
  registrations   GameRegistration[]

  @@index([status, startDate])
}

model GameRegistration {
  id        Int      @id @default(autoincrement())
  gameId    Int
  game      Game     @relation(fields: [gameId], references: [id])
  userId    Int
  user      User     @relation("UserGameRegistrations", fields: [userId], references: [id])
  status    RegistrationStatus @default(REGISTERED)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([gameId, userId])
}

enum GameStatus {
  UPCOMING
  ONGOING
  COMPLETED
  CANCELLED
}

enum RegistrationStatus {
  REGISTERED
  CANCELLED
  ATTENDED
  NO_SHOW
}
```

## Key Database Features

### 1. Relationships
- One-to-Many: User to Polls, Payments, Notifications
- Many-to-One: Votes to Poll, Payment to PaymentRequest
- Unique Constraints: One vote per user per poll

### 2. Indexes
- User email (unique)
- Notification user and read status
- Payment transaction ID (unique)

### 3. Timestamps
- CreatedAt and UpdatedAt on relevant models
- OTP expiry tracking
- Payment dates

### 4. Enums
- User Roles
- OTP Types
- Payment Status
- Notification Types 

## Game Service Functions

### 1. Create Game
```typescript
createGame(data: {
  title: string;
  description: string;
  maxParticipants: number;
  startDate: Date;
  endDate: Date;
  location?: string;
  createdById: number;
})
```
Creates a new game with the specified details. Returns the created game with creator information.

### 2. Register for Game
```typescript
registerForGame(gameId: number, userId: number)
```
Registers a user for a game. Includes validation for:
- Game existence
- Available spots
- Game status (must be UPCOMING)
- Duplicate registration

### 3. Update Game Status
```typescript
updateGameStatus(gameId: number, status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED')
```
Updates the status of a game and notifies all registered users about the change.

## Notification Types

The system now includes additional notification types for game-related events:

1. `GAME_REGISTRATION`
   - Triggered when a user registers for a game
   - Sent to the game creator
   - Includes registrant's name and game title

2. `GAME_STATUS_CHANGE`
   - Triggered when a game's status is updated
   - Sent to all registered users
   - Includes game title and new status

## Game Registration Flow

1. **Game Creation (Admin)**
   - Admin creates game with details
   - System sets initial status as UPCOMING
   - All users are notified of new game

2. **User Registration**
   - User requests to register
   - System validates:
     - Game exists and is UPCOMING
     - Spots are available
     - User hasn't already registered
   - Registration is created
   - Game creator is notified

3. **Status Updates (Admin)**
   - Admin can update game status
   - All registered users are notified
   - Status changes affect registration availability

## Error Handling

The game system includes specific error messages for common scenarios:

1. Game Registration Errors:
   - "Game not found"
   - "Game registration is not open"
   - "Game is full"
   - "Already registered for this game"

2. Status Update Errors:
   - Invalid status values
   - Game not found
   - Unauthorized access

## Security Considerations

1. **Access Control**
   - Game creation: Admin only
   - Status updates: Admin only
   - Registration: Authenticated users
   - View registrations: Admin only

2. **Data Validation**
   - Required fields validation
   - Date validation
   - Status enum validation
   - Participant limit validation

3. **Notification Security**
   - Notifications are user-specific
   - Admin actions trigger appropriate notifications
   - Sensitive information is excluded from notifications 