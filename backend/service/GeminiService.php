<?php
/**
 * GeminiService.php
 * 
 *  1. Designed for communication between cURL and the Gemini API,
 *     Reads API keys, timeout settings, and handles errors.
 *
 *  2. Uses a return-value style
 *     (['success'=>bool, ...]) to pass results/errors up to
 *     ChatbotLogic.php
 * 
 */

require_once __DIR__ . '/../config/Env.php';

/**
 * 
 *
 * @param string $systemPrompt 
 * @param string $studentQuestion 
 * @return array{success: bool, text?: string, error?: string}
 */
function callGeminiApi(string $systemPrompt, string $studentQuestion): array
{
    $apiKey = (string) env('GEMINI_API_KEY', '');
    $apiUrl = (string) env(
        'GEMINI_API_URL',
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
    );
    $timeoutSeconds = (int) env('GEMINI_TIMEOUT_SECONDS', 15);

    if ($apiKey === '') {
        error_log('[GeminiService] GEMINI_API_KEY have not config,Please check your .env file');
        return ['success' => false, 'error' => 'API_KEY_MISSING'];
    }

    //Gemini Fixed Request Format
    $requestQuestion = [
        'contents' => [
            [
                'role' => 'user',
                'parts' => [
                    ['text' => $systemPrompt . "\n\nStudentQuestion: " . $studentQuestion],
                ],
            ],
        ],
    ];

    $url = $apiUrl . '?key=' . urlencode($apiKey);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode($requestQuestion, JSON_UNESCAPED_UNICODE),
        CURLOPT_TIMEOUT => $timeoutSeconds,
        CURLOPT_CONNECTTIMEOUT => 5,
    ]);

    $response = curl_exec($ch); // The raw response body from Gemini API
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE); // HTTP status code (200,403,500)
    $curlError = curl_error($ch); // Connection timed out
    curl_close($ch);

    if ($response === false) {
        error_log('[GeminiService] cURL Failed: ' . $curlError);
        return ['success' => false, 'error' => 'NETWORK_ERROR'];
    }

    if ($httpCode !== 200) {
        error_log("[GeminiService] Gemini API Failed 200: {$httpCode}, body: {$response}");
        return ['success' => false, 'error' => 'API_BAD_STATUS'];
    }

    $decoded = json_decode($response, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log('[GeminiService] Gemini API Failed to decode JSON');
        return ['success' => false, 'error' => 'INVALID_JSON'];
    }



    // Gemini API response format
    $text = $decoded['candidates'][0]['content']['parts'][0]['text'] ?? null;

    if ($text === null) {
        error_log('[GeminiService] Gemini API Failed to find answer text in response');
        return ['success' => false, 'error' => 'UNEXPECTED_RESPONSE_SHAPE'];
    }

    return ['success' => true, 'text' => $text];
}