-- Migración única desde el esquema original de MiCon.
-- Si existen varios administradores, detenerse y asignar los datos antiguos manualmente
-- antes de habilitar esta migración para evitar mezclar condominios.
USE `miconnn`;

DELIMITER $$
DROP PROCEDURE IF EXISTS `assert_single_legacy_admin`$$
CREATE PROCEDURE `assert_single_legacy_admin`()
BEGIN
  DECLARE admin_count int DEFAULT 0;
  SELECT COUNT(*) INTO admin_count FROM users WHERE role = 'admin';
  IF admin_count > 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Hay más de un administrador existente; asigna manualmente sus datos antes de migrar.';
  END IF;
END$$
DELIMITER ;
CALL `assert_single_legacy_admin`();
DROP PROCEDURE `assert_single_legacy_admin`;

CREATE TABLE `condominiums` (
  `id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL,
  `owner_user_id` int NOT NULL, `unit_count` int DEFAULT NULL,
  `rules` text DEFAULT NULL, `has_guards` tinyint(1) NOT NULL DEFAULT 0,
  `setup_step` tinyint NOT NULL DEFAULT 0, `setup_completed` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(), PRIMARY KEY (`id`),
  UNIQUE KEY `owner_user_id` (`owner_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `users`
  ADD COLUMN `condo_id` int DEFAULT NULL,
  ADD COLUMN `pending_unit_number` varchar(50) DEFAULT NULL,
  ADD COLUMN `resident_status` enum('propietario','inquilino') DEFAULT NULL,
  ADD COLUMN `owner_name` varchar(255) DEFAULT NULL,
  ADD COLUMN `emergency_phone` varchar(50) DEFAULT NULL,
  ADD COLUMN `profile_photo_uri` mediumtext DEFAULT NULL,
  ADD COLUMN `membership_code` varchar(16) DEFAULT NULL,
  ADD UNIQUE KEY `membership_code` (`membership_code`),
  ADD KEY `idx_users_condo` (`condo_id`);

ALTER TABLE `announcements` ADD COLUMN `condo_id` int DEFAULT NULL, ADD KEY `idx_announcements_condo` (`condo_id`);
ALTER TABLE `area_schedules` ADD COLUMN `condo_id` int DEFAULT NULL, ADD KEY `idx_schedules_condo` (`condo_id`);
ALTER TABLE `debts` ADD COLUMN `condo_id` int DEFAULT NULL, ADD KEY `idx_debts_condo` (`condo_id`);
ALTER TABLE `payments` ADD COLUMN `condo_id` int DEFAULT NULL, ADD KEY `idx_payments_condo` (`condo_id`);
ALTER TABLE `properties` ADD COLUMN `condo_id` int DEFAULT NULL, DROP INDEX `unit_number`, ADD UNIQUE KEY `uq_property_unit_condo` (`condo_id`,`unit_number`), ADD KEY `idx_properties_condo` (`condo_id`);
ALTER TABLE `qr_codes` ADD COLUMN `condo_id` int DEFAULT NULL, ADD KEY `idx_qr_condo` (`condo_id`);
ALTER TABLE `qr_scans` ADD COLUMN `condo_id` int DEFAULT NULL, ADD KEY `idx_scans_condo` (`condo_id`);
ALTER TABLE `reports` ADD COLUMN `condo_id` int DEFAULT NULL, ADD KEY `idx_reports_condo` (`condo_id`);
ALTER TABLE `reservations` ADD COLUMN `condo_id` int DEFAULT NULL, ADD KEY `idx_reservations_condo` (`condo_id`);
ALTER TABLE `reservation_areas` ADD COLUMN `condo_id` int DEFAULT NULL, ADD UNIQUE KEY `uq_area_name_condo` (`condo_id`,`name`), ADD KEY `idx_areas_condo` (`condo_id`);

SET @legacy_admin_id = (SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1);
INSERT INTO condominiums (name, owner_user_id)
SELECT CONCAT('Condominio ', full_name), id FROM users WHERE id = @legacy_admin_id;
SET @legacy_condo_id = IF(@legacy_admin_id IS NULL, NULL, LAST_INSERT_ID());
UPDATE users SET condo_id = @legacy_condo_id WHERE @legacy_condo_id IS NOT NULL;
UPDATE announcements SET condo_id = @legacy_condo_id;
UPDATE area_schedules SET condo_id = @legacy_condo_id;
UPDATE debts SET condo_id = @legacy_condo_id;
UPDATE payments SET condo_id = @legacy_condo_id;
UPDATE properties SET condo_id = @legacy_condo_id;
UPDATE qr_codes SET condo_id = @legacy_condo_id;
UPDATE qr_scans SET condo_id = @legacy_condo_id;
UPDATE reports SET condo_id = @legacy_condo_id;
UPDATE reservations SET condo_id = @legacy_condo_id;
UPDATE reservation_areas SET condo_id = @legacy_condo_id;

ALTER TABLE `users` ADD CONSTRAINT `fk_users_condo` FOREIGN KEY (`condo_id`) REFERENCES `condominiums` (`id`) ON DELETE SET NULL;
ALTER TABLE `condominiums` ADD CONSTRAINT `fk_condominiums_owner` FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `announcements` ADD CONSTRAINT `fk_announcements_condo` FOREIGN KEY (`condo_id`) REFERENCES `condominiums` (`id`) ON DELETE CASCADE;
ALTER TABLE `area_schedules` ADD CONSTRAINT `fk_schedules_condo` FOREIGN KEY (`condo_id`) REFERENCES `condominiums` (`id`) ON DELETE CASCADE;
ALTER TABLE `debts` ADD CONSTRAINT `fk_debts_condo` FOREIGN KEY (`condo_id`) REFERENCES `condominiums` (`id`) ON DELETE CASCADE;
ALTER TABLE `payments` ADD CONSTRAINT `fk_payments_condo` FOREIGN KEY (`condo_id`) REFERENCES `condominiums` (`id`) ON DELETE CASCADE;
ALTER TABLE `properties` ADD CONSTRAINT `fk_properties_condo` FOREIGN KEY (`condo_id`) REFERENCES `condominiums` (`id`) ON DELETE CASCADE;
ALTER TABLE `qr_codes` ADD CONSTRAINT `fk_qr_condo` FOREIGN KEY (`condo_id`) REFERENCES `condominiums` (`id`) ON DELETE CASCADE;
ALTER TABLE `qr_scans` ADD CONSTRAINT `fk_scans_condo` FOREIGN KEY (`condo_id`) REFERENCES `condominiums` (`id`) ON DELETE CASCADE;
ALTER TABLE `reports` ADD CONSTRAINT `fk_reports_condo` FOREIGN KEY (`condo_id`) REFERENCES `condominiums` (`id`) ON DELETE CASCADE;
ALTER TABLE `reservations` ADD CONSTRAINT `fk_reservations_condo` FOREIGN KEY (`condo_id`) REFERENCES `condominiums` (`id`) ON DELETE CASCADE;
ALTER TABLE `reservation_areas` ADD CONSTRAINT `fk_areas_condo` FOREIGN KEY (`condo_id`) REFERENCES `condominiums` (`id`) ON DELETE CASCADE;
