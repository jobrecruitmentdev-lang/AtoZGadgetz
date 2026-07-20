-- CreateTable
CREATE TABLE `cj_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cj_category_id` VARCHAR(191) NOT NULL,
    `parent_cj_category_id` VARCHAR(191) NULL,
    `name` VARCHAR(150) NOT NULL,
    `level` INTEGER NOT NULL,
    `synced_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cj_categories_cj_category_id_key`(`cj_category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
