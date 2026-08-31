-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 31, 2026 at 02:50 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `benna_easy_mecca`
--

-- --------------------------------------------------------

--
-- Table structure for table `agencies`
--

CREATE TABLE `agencies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `agency_name` varchar(255) NOT NULL,
  `agency_type` enum('BD','SAUDI') NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `opening_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `opening_balance_type` enum('DR','CR') NOT NULL DEFAULT 'DR',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `agencies`
--

INSERT INTO `agencies` (`id`, `agency_name`, `agency_type`, `contact_person`, `phone`, `address`, `opening_balance`, `opening_balance_type`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Test BD Agency', 'BD', NULL, NULL, NULL, 0.00, 'DR', NULL, NULL, NULL),
(2, 'Test Saudi Agency', 'SAUDI', NULL, NULL, NULL, 0.00, 'DR', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `attachments`
--

CREATE TABLE `attachments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `attachable_type` varchar(255) NOT NULL,
  `attachable_id` bigint(20) UNSIGNED NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `file_type` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `document_number_sequences`
--

CREATE TABLE `document_number_sequences` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `document_type` varchar(255) NOT NULL,
  `financial_year` varchar(255) NOT NULL,
  `last_number` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `document_number_sequences`
--

INSERT INTO `document_number_sequences` (`id`, `document_type`, `financial_year`, `last_number`, `created_at`, `updated_at`) VALUES
(1, 'INV', '2026', 3, '2026-08-30 13:33:56', '2026-08-31 00:56:58'),
(2, 'PUR', '2026', 4, '2026-08-30 13:39:14', '2026-08-31 05:56:13'),
(3, 'VOU', '2026', 4, '2026-08-30 13:39:28', '2026-08-31 05:56:31');

-- --------------------------------------------------------

--
-- Table structure for table `exchange_rates`
--

CREATE TABLE `exchange_rates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `rate_date` date NOT NULL,
  `rate` decimal(10,4) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `g_codes`
--

CREATE TABLE `g_codes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(255) NOT NULL,
  `agency_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `g_codes`
--

INSERT INTO `g_codes` (`id`, `code`, `agency_id`, `created_at`, `updated_at`) VALUES
(1, 'G001', 1, NULL, NULL),
(2, 'G002', 2, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `invoice_items`
--

CREATE TABLE `invoice_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `invoice_master_id` bigint(20) UNSIGNED NOT NULL,
  `item_type` enum('UMRAH VISA','BRN CHARGE','TRANSPORT','NAQABA-FINE','ESCAPED FINE TO','HOTEL','MULTIPLE VISA') NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `note` text DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoice_items`
--

INSERT INTO `invoice_items` (`id`, `invoice_master_id`, `item_type`, `details`, `note`, `amount`, `created_at`, `updated_at`) VALUES
(1, 1, 'UMRAH VISA', '{\"pax\":5,\"rate\":1500}', NULL, 7500.00, '2026-08-30 13:33:56', '2026-08-30 13:33:56'),
(2, 2, 'UMRAH VISA', '{\"pax\":\"1\",\"rate\":\"312\"}', NULL, 312.00, '2026-08-30 23:43:57', '2026-08-30 23:43:57'),
(3, 3, 'UMRAH VISA', '{\"pax\":\"12\",\"rate\":\"50\"}', NULL, 600.00, '2026-08-31 00:56:58', '2026-08-31 00:56:58'),
(4, 3, 'ESCAPED FINE TO', '{\"sale_amount\":\"500\"}', NULL, 500.00, '2026-08-31 00:56:58', '2026-08-31 00:56:58');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_masters`
--

CREATE TABLE `invoice_masters` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `invoice_no` varchar(255) NOT NULL,
  `invoice_date` date NOT NULL,
  `agency_id` bigint(20) UNSIGNED NOT NULL,
  `g_code_id` bigint(20) UNSIGNED NOT NULL,
  `total_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoice_masters`
--

INSERT INTO `invoice_masters` (`id`, `invoice_no`, `invoice_date`, `agency_id`, `g_code_id`, `total_amount`, `notes`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'INV-2026-00001', '2026-08-30', 1, 1, 7500.00, NULL, '2026-08-30 13:33:56', '2026-08-30 13:33:56', NULL),
(2, 'INV-2026-00002', '2026-08-31', 1, 1, 312.00, NULL, '2026-08-30 23:43:57', '2026-08-30 23:43:57', NULL),
(3, 'INV-2026-00003', '2026-08-31', 1, 1, 1100.00, NULL, '2026-08-31 00:56:58', '2026-08-31 00:56:58', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_01_01_000001_create_agencies_table', 1),
(5, '2025_01_01_000002_create_g_codes_table', 1),
(6, '2025_01_01_000003_create_exchange_rates_table', 1),
(7, '2025_01_01_000004_create_document_number_sequences_table', 1),
(8, '2025_01_01_000005_create_invoice_masters_table', 1),
(9, '2025_01_01_000006_create_invoice_items_table', 1),
(10, '2025_01_01_000007_create_purchase_masters_table', 1),
(11, '2025_01_01_000008_create_purchase_items_table', 1),
(12, '2025_01_01_000009_create_payment_transactions_table', 1),
(13, '2025_01_01_000010_create_attachments_table', 1),
(14, '2026_08_30_153419_create_personal_access_tokens_table', 2),
(15, '2025_01_02_000001_create_payment_allocations_table', 3);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_allocations`
--

CREATE TABLE `payment_allocations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `payment_transaction_id` bigint(20) UNSIGNED NOT NULL,
  `allocatable_type` varchar(255) NOT NULL,
  `allocatable_id` bigint(20) UNSIGNED NOT NULL,
  `allocated_amount` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_allocations`
--

INSERT INTO `payment_allocations` (`id`, `payment_transaction_id`, `allocatable_type`, `allocatable_id`, `allocated_amount`, `created_at`, `updated_at`) VALUES
(1, 1, 'App\\Models\\InvoiceMaster', 1, 500.00, '2026-08-31 05:50:55', '2026-08-31 05:50:55'),
(2, 2, 'App\\Models\\InvoiceMaster', 1, 5000.00, '2026-08-31 05:52:43', '2026-08-31 05:52:43'),
(3, 4, 'App\\Models\\InvoiceMaster', 1, 2000.00, '2026-08-31 05:57:14', '2026-08-31 05:57:14'),
(4, 4, 'App\\Models\\InvoiceMaster', 2, 312.00, '2026-08-31 05:57:14', '2026-08-31 05:57:14'),
(5, 4, 'App\\Models\\InvoiceMaster', 3, 1100.00, '2026-08-31 05:57:14', '2026-08-31 05:57:14'),
(6, 3, 'App\\Models\\PurchaseMaster', 4, 40.00, '2026-08-31 05:57:46', '2026-08-31 05:57:46');

-- --------------------------------------------------------

--
-- Table structure for table `payment_transactions`
--

CREATE TABLE `payment_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `voucher_no` varchar(255) NOT NULL,
  `transaction_date` date NOT NULL,
  `agency_id` bigint(20) UNSIGNED NOT NULL,
  `g_code_id` bigint(20) UNSIGNED NOT NULL,
  `transaction_type` enum('RECEIVE','PAYMENT') NOT NULL,
  `mode_of_payment` varchar(255) NOT NULL,
  `bd_amount` decimal(15,2) DEFAULT NULL,
  `exchange_rate` decimal(10,4) DEFAULT NULL,
  `sar_amount` decimal(15,2) NOT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_transactions`
--

INSERT INTO `payment_transactions` (`id`, `voucher_no`, `transaction_date`, `agency_id`, `g_code_id`, `transaction_type`, `mode_of_payment`, `bd_amount`, `exchange_rate`, `sar_amount`, `note`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'VOU-2026-00001', '2026-08-30', 1, 1, 'RECEIVE', 'CASH', NULL, NULL, 500.00, NULL, '2026-08-30 13:39:28', '2026-08-30 13:39:28', NULL),
(2, 'VOU-2026-00002', '2026-08-31', 1, 1, 'RECEIVE', 'Bank Transfer', NULL, NULL, 5000.00, 'adfasd', '2026-08-31 00:56:09', '2026-08-31 00:56:09', NULL),
(3, 'VOU-2026-00003', '2026-08-31', 2, 2, 'PAYMENT', 'Bank Transfer', 5000.00, 125.0000, 40.00, NULL, '2026-08-31 00:56:30', '2026-08-31 00:56:30', NULL),
(4, 'VOU-2026-00004', '2026-08-31', 1, 1, 'RECEIVE', 'Bank Transfer', NULL, NULL, 9000.00, NULL, '2026-08-31 05:56:31', '2026-08-31 05:56:31', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_items`
--

CREATE TABLE `purchase_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `purchase_master_id` bigint(20) UNSIGNED NOT NULL,
  `item_type` enum('UMRAH VISA','BRN CHARGE','TRANSPORT','NAQABA-FINE','ESCAPED FINE TO','HOTEL','MULTIPLE VISA') NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `note` text DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_items`
--

INSERT INTO `purchase_items` (`id`, `purchase_master_id`, `item_type`, `details`, `note`, `amount`, `created_at`, `updated_at`) VALUES
(1, 1, 'HOTEL', '{\"rate\":150,\"nights\":3,\"rooms\":2}', NULL, 900.00, '2026-08-30 13:39:14', '2026-08-30 13:39:14'),
(2, 2, 'UMRAH VISA', '{\"pax\":\"5\",\"rate\":\"5\"}', NULL, 25.00, '2026-08-30 23:44:27', '2026-08-30 23:44:27'),
(3, 3, 'TRANSPORT', '{\"sale_amount\":\"5000\"}', NULL, 5000.00, '2026-08-31 00:56:40', '2026-08-31 00:56:40'),
(4, 4, 'UMRAH VISA', '{\"pax\":\"10\",\"rate\":\"500\"}', NULL, 5000.00, '2026-08-31 05:56:13', '2026-08-31 05:56:13'),
(5, 4, 'BRN CHARGE', '{\"pax\":\"2\",\"rate\":\"100\"}', NULL, 200.00, '2026-08-31 05:56:13', '2026-08-31 05:56:13');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_masters`
--

CREATE TABLE `purchase_masters` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `purchase_no` varchar(255) NOT NULL,
  `purchase_date` date NOT NULL,
  `agency_id` bigint(20) UNSIGNED NOT NULL,
  `g_code_id` bigint(20) UNSIGNED NOT NULL,
  `total_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_masters`
--

INSERT INTO `purchase_masters` (`id`, `purchase_no`, `purchase_date`, `agency_id`, `g_code_id`, `total_amount`, `notes`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'PUR-2026-00001', '2026-08-30', 1, 1, 900.00, NULL, '2026-08-30 13:39:14', '2026-08-30 13:39:14', NULL),
(2, 'PUR-2026-00002', '2026-08-31', 2, 2, 25.00, NULL, '2026-08-30 23:44:27', '2026-08-30 23:44:27', NULL),
(3, 'PUR-2026-00003', '2026-08-31', 2, 2, 5000.00, NULL, '2026-08-31 00:56:40', '2026-08-31 00:56:40', NULL),
(4, 'PUR-2026-00004', '2026-08-31', 2, 2, 5200.00, NULL, '2026-08-31 05:56:13', '2026-08-31 05:56:13', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('cos3sXt9Fq7WKnWe1Bqf4Nu4byHjBsb5cV9igz6q', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiMWlKbDk5NFZGRzRaV1VQTnh4YXhZbVlXU2ZjMjhLc1ZEN2d5V2lGciI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1788126487);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `agencies`
--
ALTER TABLE `agencies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `attachments`
--
ALTER TABLE `attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attachments_attachable_type_attachable_id_index` (`attachable_type`,`attachable_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `document_number_sequences`
--
ALTER TABLE `document_number_sequences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `document_number_sequences_document_type_financial_year_unique` (`document_type`,`financial_year`);

--
-- Indexes for table `exchange_rates`
--
ALTER TABLE `exchange_rates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `exchange_rates_rate_date_unique` (`rate_date`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `g_codes`
--
ALTER TABLE `g_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `g_codes_code_unique` (`code`),
  ADD KEY `g_codes_agency_id_foreign` (`agency_id`);

--
-- Indexes for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_items_invoice_master_id_foreign` (`invoice_master_id`);

--
-- Indexes for table `invoice_masters`
--
ALTER TABLE `invoice_masters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_masters_invoice_no_unique` (`invoice_no`),
  ADD KEY `invoice_masters_agency_id_invoice_date_index` (`agency_id`,`invoice_date`),
  ADD KEY `invoice_masters_g_code_id_index` (`g_code_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `payment_allocations`
--
ALTER TABLE `payment_allocations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_allocations_payment_transaction_id_foreign` (`payment_transaction_id`),
  ADD KEY `payment_allocations_allocatable_type_allocatable_id_index` (`allocatable_type`,`allocatable_id`);

--
-- Indexes for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_transactions_voucher_no_unique` (`voucher_no`),
  ADD KEY `payment_transactions_agency_id_transaction_date_index` (`agency_id`,`transaction_date`),
  ADD KEY `payment_transactions_g_code_id_index` (`g_code_id`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_items_purchase_master_id_foreign` (`purchase_master_id`);

--
-- Indexes for table `purchase_masters`
--
ALTER TABLE `purchase_masters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `purchase_masters_purchase_no_unique` (`purchase_no`),
  ADD KEY `purchase_masters_agency_id_purchase_date_index` (`agency_id`,`purchase_date`),
  ADD KEY `purchase_masters_g_code_id_index` (`g_code_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `agencies`
--
ALTER TABLE `agencies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `attachments`
--
ALTER TABLE `attachments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `document_number_sequences`
--
ALTER TABLE `document_number_sequences`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `exchange_rates`
--
ALTER TABLE `exchange_rates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `g_codes`
--
ALTER TABLE `g_codes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `invoice_items`
--
ALTER TABLE `invoice_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `invoice_masters`
--
ALTER TABLE `invoice_masters`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `payment_allocations`
--
ALTER TABLE `payment_allocations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_items`
--
ALTER TABLE `purchase_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `purchase_masters`
--
ALTER TABLE `purchase_masters`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `g_codes`
--
ALTER TABLE `g_codes`
  ADD CONSTRAINT `g_codes_agency_id_foreign` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `invoice_items_invoice_master_id_foreign` FOREIGN KEY (`invoice_master_id`) REFERENCES `invoice_masters` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `invoice_masters`
--
ALTER TABLE `invoice_masters`
  ADD CONSTRAINT `invoice_masters_agency_id_foreign` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`),
  ADD CONSTRAINT `invoice_masters_g_code_id_foreign` FOREIGN KEY (`g_code_id`) REFERENCES `g_codes` (`id`);

--
-- Constraints for table `payment_allocations`
--
ALTER TABLE `payment_allocations`
  ADD CONSTRAINT `payment_allocations_payment_transaction_id_foreign` FOREIGN KEY (`payment_transaction_id`) REFERENCES `payment_transactions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD CONSTRAINT `payment_transactions_agency_id_foreign` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`),
  ADD CONSTRAINT `payment_transactions_g_code_id_foreign` FOREIGN KEY (`g_code_id`) REFERENCES `g_codes` (`id`);

--
-- Constraints for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD CONSTRAINT `purchase_items_purchase_master_id_foreign` FOREIGN KEY (`purchase_master_id`) REFERENCES `purchase_masters` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `purchase_masters`
--
ALTER TABLE `purchase_masters`
  ADD CONSTRAINT `purchase_masters_agency_id_foreign` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`),
  ADD CONSTRAINT `purchase_masters_g_code_id_foreign` FOREIGN KEY (`g_code_id`) REFERENCES `g_codes` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
