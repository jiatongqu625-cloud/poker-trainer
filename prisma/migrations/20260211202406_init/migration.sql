-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Scenario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tableType" TEXT NOT NULL DEFAULT '6max',
    "position" TEXT NOT NULL,
    "villainPositionsJson" TEXT NOT NULL DEFAULT '[]',
    "stackBb" INTEGER NOT NULL,
    "players" INTEGER NOT NULL,
    "preflopAction" TEXT NOT NULL,
    "preflopConfigJson" TEXT,
    "trainingNode" TEXT NOT NULL DEFAULT 'FLOP_CBET',
    "flopTexture" TEXT NOT NULL,
    "flopTextureWeightsJson" TEXT NOT NULL DEFAULT '{}',
    "boardProfileWeightsJson" TEXT NOT NULL DEFAULT '{}',
    "opponentTagsJson" TEXT NOT NULL DEFAULT '[]',
    "weight" INTEGER NOT NULL DEFAULT 1,
    "parentId" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Scenario_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Scenario" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Scenario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DrillSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DrillSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DrillSession_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DrillHand" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "heroHand" TEXT NOT NULL,
    "boardTexture" TEXT NOT NULL,
    "recommendedStrategyJson" TEXT NOT NULL DEFAULT '{}',
    "recommendationReason" TEXT NOT NULL,
    "userAction" TEXT,
    "result" TEXT,
    "spotJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DrillHand_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "DrillSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DrillHand_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OpponentProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "hands" INTEGER NOT NULL DEFAULT 0,
    "vpipCount" INTEGER NOT NULL DEFAULT 0,
    "pfrCount" INTEGER NOT NULL DEFAULT 0,
    "threeBetCount" INTEGER NOT NULL DEFAULT 0,
    "cbetCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OpponentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HandHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "opponentId" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "parsedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HandHistory_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "OpponentProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_sessionId_key" ON "User"("sessionId");

-- CreateIndex
CREATE INDEX "Scenario_userId_idx" ON "Scenario"("userId");

-- CreateIndex
CREATE INDEX "Scenario_parentId_idx" ON "Scenario"("parentId");

-- CreateIndex
CREATE INDEX "DrillSession_userId_idx" ON "DrillSession"("userId");

-- CreateIndex
CREATE INDEX "DrillSession_scenarioId_idx" ON "DrillSession"("scenarioId");

-- CreateIndex
CREATE INDEX "DrillHand_sessionId_idx" ON "DrillHand"("sessionId");

-- CreateIndex
CREATE INDEX "DrillHand_scenarioId_idx" ON "DrillHand"("scenarioId");

-- CreateIndex
CREATE INDEX "OpponentProfile_userId_idx" ON "OpponentProfile"("userId");

-- CreateIndex
CREATE INDEX "HandHistory_opponentId_idx" ON "HandHistory"("opponentId");
