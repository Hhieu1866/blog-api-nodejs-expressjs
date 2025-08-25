/*
  Warnings:

  - A unique constraint covering the columns `[hashnodeId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Post` ADD COLUMN `hashnodeId` VARCHAR(191) NULL,
    ADD COLUMN `hashnodeUrl` VARCHAR(191) NULL,
    ADD COLUMN `isPublishedOnHashnode` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX `Post_hashnodeId_key` ON `Post`(`hashnodeId`);
