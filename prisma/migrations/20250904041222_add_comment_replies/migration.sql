-- AlterTable
ALTER TABLE `comment` ADD COLUMN `parent_id` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Comment_parent_id_idx` ON `Comment`(`parent_id`);

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `Comment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
