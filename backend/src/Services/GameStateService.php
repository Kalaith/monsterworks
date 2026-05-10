<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AuthUser;
use RuntimeException;

final class GameStateService
{
    public function __construct(
        private readonly string $gameSlug,
        private readonly string $gameName
    ) {
    }

    public function initialState(): array
    {
        return [
            'game_slug' => $this->gameSlug,
            'game_name' => $this->gameName,
            'schema_version' => 2,
            'gameState' => [],
            'last_intent' => null,
            'last_intent_at' => null,
            'created_at' => gmdate('Y-m-d H:i:s'),
        ];
    }

    public function applyIntent(array $currentState, string $intent, array $payload): array
    {
        if ($intent === 'reset_game') {
            return $this->initialState();
        }

        $state = $payload['state'] ?? null;
        if (!is_array($state)) {
            throw new RuntimeException('Authoritative game state is required.');
        }

        return [
            'game_slug' => $this->gameSlug,
            'game_name' => $this->gameName,
            'schema_version' => 2,
            'gameState' => $state,
            'last_intent' => $intent,
            'last_intent_at' => gmdate('c'),
            'created_at' => is_string($currentState['created_at'] ?? null)
                ? $currentState['created_at']
                : gmdate('Y-m-d H:i:s'),
        ];
    }

    public function response(array $save, AuthUser $user): array
    {
        return [
            'user' => $user->toArray(),
            'save' => [
                'id' => $save['id'],
                'slot' => $save['save_slot'],
                'state' => $this->normalizeState($save['state']),
                'metadata' => $save['metadata'],
                'version' => $save['version'],
                'status' => $save['status'],
                'created_at' => $save['created_at'],
                'updated_at' => $save['updated_at'],
            ],
        ];
    }

    private function normalizeState(array $state): array
    {
        $base = $this->initialState();
        return [
            ...$base,
            ...$state,
            'game_slug' => $this->gameSlug,
            'game_name' => $this->gameName,
            'schema_version' => 2,
            'gameState' => is_array($state['gameState'] ?? null) ? $state['gameState'] : [],
            'last_intent' => is_string($state['last_intent'] ?? null) ? $state['last_intent'] : null,
            'last_intent_at' => is_string($state['last_intent_at'] ?? null) ? $state['last_intent_at'] : null,
        ];
    }
}
