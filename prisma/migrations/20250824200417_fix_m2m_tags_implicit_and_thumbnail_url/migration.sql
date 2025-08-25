-- AlterTable
ALTER TABLE `Post` ADD COLUMN `thumbnailUrl` VARCHAR(191) NULL,
    MODIFY `content` VARCHAR(191) NOT NULL,
    MODIFY `published` BOOLEAN NOT NULL DEFAULT true;

-- RenameIndex
ALTER TABLE `Post` RENAME INDEX `Post_authorId_fkey` TO `Post_authorId_idx`;

-- RenameIndex
ALTER TABLE `Post` RENAME INDEX `Post_categoryId_fkey` TO `Post_categoryId_idx`;
