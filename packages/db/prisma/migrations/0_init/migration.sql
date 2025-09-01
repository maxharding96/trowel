-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('ForSale', 'Draft');

-- CreateEnum
CREATE TYPE "public"."Currency" AS ENUM ('USD', 'GBP', 'EUR', 'CAD', 'AUD', 'JPY', 'CHF', 'MXN', 'BRL', 'NZD', 'SEK', 'ZAR');

-- CreateEnum
CREATE TYPE "public"."Condition" AS ENUM ('Mint', 'NearMint', 'VeryGoodPlus', 'VeryGood', 'GoodPlus', 'Good', 'Fair', 'Poor');

-- CreateEnum
CREATE TYPE "public"."SleeveCondition" AS ENUM ('Mint', 'NearMint', 'VeryGoodPlus', 'VeryGood', 'GoodPlus', 'Good', 'Fair', 'Poor', 'Generic', 'NotGraded', 'NoCover');

-- CreateTable
CREATE TABLE "public"."Artist" (
    "id" TEXT NOT NULL,
    "externalId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "resourceUrl" TEXT NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Track" (
    "releaseId" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("releaseId","position")
);

-- CreateTable
CREATE TABLE "public"."Video" (
    "id" TEXT NOT NULL,
    "releaseId" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "embed" BOOLEAN NOT NULL,
    "title" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "embedding" JSONB,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Release" (
    "id" TEXT NOT NULL,
    "externalId" INTEGER NOT NULL,
    "thumb" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "lowestPrice" DOUBLE PRECISION,
    "numForSale" INTEGER NOT NULL,
    "resoucrceUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "styles" TEXT[],
    "uri" TEXT NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Want" (
    "id" TEXT NOT NULL,
    "externalId" INTEGER NOT NULL,
    "user" TEXT NOT NULL,
    "resourceUrl" TEXT NOT NULL,
    "searchId" TEXT NOT NULL,

    CONSTRAINT "Want_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Listing" (
    "id" TEXT NOT NULL,
    "externalId" INTEGER NOT NULL,
    "user" TEXT NOT NULL,
    "status" "public"."Status" NOT NULL,
    "allowOffers" BOOLEAN NOT NULL,
    "condition" "public"."Condition" NOT NULL,
    "sleeveCondition" "public"."SleeveCondition" NOT NULL,
    "shipsFrom" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "comments" TEXT NOT NULL,
    "releaseId" TEXT NOT NULL,
    "resourceUrl" TEXT NOT NULL,
    "audio" BOOLEAN NOT NULL,
    "searchId" TEXT NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Price" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" "public"."Currency" NOT NULL,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Search" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Search_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_ArtistToRelease" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ArtistToRelease_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Artist_externalId_key" ON "public"."Artist"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Release_externalId_key" ON "public"."Release"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Want_externalId_key" ON "public"."Want"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_externalId_key" ON "public"."Listing"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Price_listingId_key" ON "public"."Price"("listingId");

-- CreateIndex
CREATE INDEX "_ArtistToRelease_B_index" ON "public"."_ArtistToRelease"("B");

-- AddForeignKey
ALTER TABLE "public"."Track" ADD CONSTRAINT "Track_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "public"."Release"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Video" ADD CONSTRAINT "Video_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "public"."Release"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Want" ADD CONSTRAINT "Want_searchId_fkey" FOREIGN KEY ("searchId") REFERENCES "public"."Search"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Listing" ADD CONSTRAINT "Listing_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "public"."Release"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Listing" ADD CONSTRAINT "Listing_searchId_fkey" FOREIGN KEY ("searchId") REFERENCES "public"."Search"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Price" ADD CONSTRAINT "Price_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ArtistToRelease" ADD CONSTRAINT "_ArtistToRelease_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ArtistToRelease" ADD CONSTRAINT "_ArtistToRelease_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

