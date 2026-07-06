-- CreateIndex
CREATE INDEX "CreatorProfile_rating_reviewsCount_idx" ON "CreatorProfile"("rating" DESC, "reviewsCount" DESC);

-- CreateIndex
CREATE INDEX "CreatorProfile_startingPrice_idx" ON "CreatorProfile"("startingPrice");
