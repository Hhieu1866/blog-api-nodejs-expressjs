/*
  Warnings:

  - You are about to drop the column `hashnodeId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `hashnodeUrl` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `isPublishedOnHashnode` on the `Post` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Post_hashnodeId_key` ON `Post`;

-- AlterTable
ALTER TABLE `Post` DROP COLUMN `hashnodeId`,
    DROP COLUMN `hashnodeUrl`,
    DROP COLUMN `isPublishedOnHashnode`,
    MODIFY `content` MEDIUMTEXT NOT NULL;
