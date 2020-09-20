CREATE DATABASE blog DEFAULT CHARACTER SET utf8mb4 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS admin_user;
DROP TABLE IF EXISTS comment;
DROP TABLE IF EXISTS post;
DROP TABLE IF EXISTS post_has_tag;
DROP TABLE IF EXISTS series;
DROP TABLE IF EXISTS subscribe;
DROP TABLE IF EXISTS tag;

CREATE TABLE `admin_user` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(127) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(127) COLLATE utf8_unicode_ci NOT NULL,
  `salt` varchar(127) COLLATE utf8_unicode_ci NOT NULL,
  `confirm_yn` tinyint(4) NOT NULL DEFAULT 0,
  `code` varchar(127) COLLATE utf8_unicode_ci DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `comment` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `post_id` int(10) unsigned NOT NULL,
  `level` int(10) unsigned NOT NULL DEFAULT 0,
  `has_replies` tinyint(4) NOT NULL DEFAULT 0,
  `reply_comment_id` int(10) unsigned DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `writer` varchar(127) COLLATE utf8_unicode_ci NOT NULL,
  `salt` varchar(127) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(127) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(127) COLLATE utf8_unicode_ci DEFAULT NULL,
  `comment` varchar(1000) COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `edited_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_postid` (`post_id`),
  KEY `ix_level` (`level`),
  KEY `ix_replycommentid` (`reply_comment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `post` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `post_header` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `post_body` text COLLATE utf8_unicode_ci NOT NULL,
  `short_description` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `open_yn` tinyint(4) NOT NULL DEFAULT 0,
  `series_id` int(10) unsigned NOT NULL DEFAULT 0,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `ix_seriesid` (`series_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `post_has_tag` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `post_id` int(10) unsigned NOT NULL,
  `tag_id` int(10) unsigned NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_postid_tagid` (`post_id`,`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `series` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `series_name` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `subscribe` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(127) COLLATE utf8_unicode_ci NOT NULL,
  `code` varchar(127) COLLATE utf8_unicode_ci NOT NULL,
  `subscribe_yn` tinyint(4) NOT NULL DEFAULT 0,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `tag` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;