<?php
/**
 * LecTags.php
 *
 * The logged-in lecturer's own study tags - the labels they can stick on their
 * study materials. A lecturer only ever sees, edits and deletes the tags they
 * created themselves.
 *
 *   GET    /api/LecTags.php   list them
 *   POST   /api/LecTags.php   create ({name}) or rename ({id, name})
 *   DELETE /api/LecTags.php   remove ({id})
 */
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../controllers/LecContentCon.php';

handleLecturerTagsRequest();
