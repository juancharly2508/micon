-- Esquema inicial de MiCon para MariaDB/MySQL.
-- Fuente: miconnn.sql proporcionado el 2026-08-29.
CREATE DATABASE IF NOT EXISTS `miconnn` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `miconnn`;

CREATE TABLE IF NOT EXISTS `announcements` (
  `id` int NOT NULL AUTO_INCREMENT, `title` varchar(255) NOT NULL, `body` text NOT NULL,
  `created_by` int DEFAULT NULL, `expires_at` datetime DEFAULT NULL, `active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(), PRIMARY KEY (`id`), KEY `created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `area_schedules` (
  `id` int NOT NULL AUTO_INCREMENT, `area_id` int NOT NULL, `day_of_week` int NOT NULL,
  `start_time` time DEFAULT NULL, `end_time` time DEFAULT NULL, `is_closed` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`), KEY `area_id` (`area_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `debts` (
  `id` int NOT NULL AUTO_INCREMENT, `property_id` int DEFAULT NULL, `user_id` int DEFAULT NULL,
  `type` varchar(50) NOT NULL, `description` text DEFAULT NULL, `amount` decimal(10,2) NOT NULL,
  `due_date` date DEFAULT NULL, `status` enum('pendiente','pagada','vencida') DEFAULT 'pendiente',
  `paid_at` datetime DEFAULT NULL, `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`), KEY `idx_debts_property` (`property_id`), KEY `idx_debts_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `payments` (
  `id` int NOT NULL AUTO_INCREMENT, `user_id` int DEFAULT NULL, `concept` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL, `payment_date` datetime DEFAULT current_timestamp(),
  `status` varchar(50) DEFAULT 'completado', `reference` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`), KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `properties` (
  `id` int NOT NULL AUTO_INCREMENT, `unit_number` varchar(50) NOT NULL, `address` text DEFAULT NULL,
  `owner_user_id` int DEFAULT NULL, `tenant_user_id` int DEFAULT NULL, `is_rental` tinyint(1) DEFAULT 0,
  `monthly_maintenance_fee` decimal(10,2) DEFAULT 0.00, `status` varchar(50) DEFAULT 'activa',
  PRIMARY KEY (`id`), UNIQUE KEY `unit_number` (`unit_number`), KEY `owner_user_id` (`owner_user_id`), KEY `tenant_user_id` (`tenant_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `qr_codes` (
  `id` int NOT NULL AUTO_INCREMENT, `user_id` int DEFAULT NULL, `property_id` int DEFAULT NULL,
  `visitor_name` varchar(255) DEFAULT NULL, `code` varchar(100) NOT NULL,
  `valid_from` datetime DEFAULT current_timestamp(), `valid_to` datetime DEFAULT NULL,
  `max_entries` int DEFAULT 1, `entries_count` int DEFAULT 0, `cost` decimal(10,2) DEFAULT 0.00,
  `paid` tinyint(1) DEFAULT 0, `status` varchar(50) DEFAULT 'activo', `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`), UNIQUE KEY `code` (`code`), KEY `property_id` (`property_id`), KEY `idx_qr_codes_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `qr_scans` (
  `id` int NOT NULL AUTO_INCREMENT, `qr_id` int DEFAULT NULL, `scanned_by_user_id` int DEFAULT NULL,
  `scanned_at` datetime DEFAULT current_timestamp(), `result` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`), KEY `qr_id` (`qr_id`), KEY `scanned_by_user_id` (`scanned_by_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `reports` (
  `id` int NOT NULL AUTO_INCREMENT, `user_id` int DEFAULT NULL, `property_id` int DEFAULT NULL,
  `type` enum('visitante','incidente','anonimo','guardia') NOT NULL, `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL, `area` varchar(255) DEFAULT NULL,
  `status` enum('abierto','en_revision','resuelto') DEFAULT 'abierto', `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`), KEY `property_id` (`property_id`), KEY `idx_reports_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `reservations` (
  `id` int NOT NULL AUTO_INCREMENT, `area_id` int DEFAULT NULL, `user_id` int DEFAULT NULL,
  `property_id` int DEFAULT NULL, `start_datetime` datetime NOT NULL, `end_datetime` datetime NOT NULL,
  `total_cost` decimal(10,2) DEFAULT 0.00, `status` enum('pendiente','confirmada','cancelada','pagada') DEFAULT 'pendiente',
  `created_at` datetime DEFAULT current_timestamp(), PRIMARY KEY (`id`), KEY `property_id` (`property_id`),
  KEY `idx_reservations_area` (`area_id`), KEY `idx_reservations_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `reservation_areas` (
  `id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `description` text DEFAULT NULL,
  `requires_reservation` tinyint(1) DEFAULT 1, `is_public` tinyint(1) DEFAULT 0,
  `cost_per_hour` decimal(10,2) DEFAULT 0.00, `cost_per_day` decimal(10,2) DEFAULT 0.00,
  `max_capacity` int DEFAULT 1, `active` tinyint(1) DEFAULT 1, PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT, `email` varchar(255) NOT NULL, `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL, `phone` varchar(50) DEFAULT NULL,
  `role` enum('admin','residente','guardia','propietario','inquilino') NOT NULL DEFAULT 'residente',
  `property_id` int DEFAULT NULL, `active` tinyint(1) DEFAULT 1, `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`), UNIQUE KEY `email` (`email`), KEY `fk_users_property` (`property_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `announcements` ADD CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
ALTER TABLE `area_schedules` ADD CONSTRAINT `area_schedules_ibfk_1` FOREIGN KEY (`area_id`) REFERENCES `reservation_areas` (`id`) ON DELETE CASCADE;
ALTER TABLE `debts` ADD CONSTRAINT `debts_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE, ADD CONSTRAINT `debts_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `payments` ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
ALTER TABLE `properties` ADD CONSTRAINT `properties_ibfk_1` FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL, ADD CONSTRAINT `properties_ibfk_2` FOREIGN KEY (`tenant_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
ALTER TABLE `qr_codes` ADD CONSTRAINT `qr_codes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE, ADD CONSTRAINT `qr_codes_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;
ALTER TABLE `qr_scans` ADD CONSTRAINT `qr_scans_ibfk_1` FOREIGN KEY (`qr_id`) REFERENCES `qr_codes` (`id`) ON DELETE CASCADE, ADD CONSTRAINT `qr_scans_ibfk_2` FOREIGN KEY (`scanned_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
ALTER TABLE `reports` ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL, ADD CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`area_id`) REFERENCES `reservation_areas` (`id`) ON DELETE CASCADE, ADD CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE, ADD CONSTRAINT `reservations_ibfk_3` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;
ALTER TABLE `users` ADD CONSTRAINT `fk_users_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE SET NULL;
