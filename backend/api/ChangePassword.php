<?php
/**
 * ChangePassword.php
 * Entry point for password reset. Any authenticated user (student,
 * lecturer, or admin) can change their OWN password through this endpoint.
 */
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../controllers/ChangePasswordController.php';

handleChangePasswordRequest();