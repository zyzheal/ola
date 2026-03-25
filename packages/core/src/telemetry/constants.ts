/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export const SERVICE_NAME = 'ola';

export const EVENT_USER_PROMPT = 'ola.user_prompt';
export const EVENT_USER_RETRY = 'ola.user_retry';
export const EVENT_TOOL_CALL = 'ola.tool_call';
export const EVENT_API_REQUEST = 'ola.api_request';
export const EVENT_API_ERROR = 'ola.api_error';
export const EVENT_API_CANCEL = 'ola.api_cancel';
export const EVENT_API_RESPONSE = 'ola.api_response';
export const EVENT_CLI_CONFIG = 'ola.config';
export const EVENT_EXTENSION_DISABLE = 'ola.extension_disable';
export const EVENT_EXTENSION_ENABLE = 'ola.extension_enable';
export const EVENT_EXTENSION_INSTALL = 'ola.extension_install';
export const EVENT_EXTENSION_UNINSTALL = 'ola.extension_uninstall';
export const EVENT_EXTENSION_UPDATE = 'ola.extension_update';
export const EVENT_FLASH_FALLBACK = 'ola.flash_fallback';
export const EVENT_RIPGREP_FALLBACK = 'ola.ripgrep_fallback';
export const EVENT_NEXT_SPEAKER_CHECK = 'ola.next_speaker_check';
export const EVENT_SLASH_COMMAND = 'ola.slash_command';
export const EVENT_IDE_CONNECTION = 'ola.ide_connection';
export const EVENT_CHAT_COMPRESSION = 'ola.chat_compression';
export const EVENT_INVALID_CHUNK = 'ola.chat.invalid_chunk';
export const EVENT_CONTENT_RETRY = 'ola.chat.content_retry';
export const EVENT_CONTENT_RETRY_FAILURE = 'ola.chat.content_retry_failure';
export const EVENT_CONVERSATION_FINISHED = 'ola.conversation_finished';
export const EVENT_MALFORMED_JSON_RESPONSE = 'ola.malformed_json_response';
export const EVENT_FILE_OPERATION = 'ola.file_operation';
export const EVENT_MODEL_SLASH_COMMAND = 'ola.slash_command.model';
export const EVENT_SUBAGENT_EXECUTION = 'ola.subagent_execution';
export const EVENT_SKILL_LAUNCH = 'ola.skill_launch';
export const EVENT_AUTH = 'ola.auth';
export const EVENT_USER_FEEDBACK = 'ola.user_feedback';

// Arena Events
export const EVENT_ARENA_SESSION_STARTED = 'ola.arena_session_started';
export const EVENT_ARENA_AGENT_COMPLETED = 'ola.arena_agent_completed';
export const EVENT_ARENA_SESSION_ENDED = 'ola.arena_session_ended';

// Performance Events
export const EVENT_STARTUP_PERFORMANCE = 'ola.startup.performance';
export const EVENT_MEMORY_USAGE = 'ola.memory.usage';
export const EVENT_PERFORMANCE_BASELINE = 'ola.performance.baseline';
export const EVENT_PERFORMANCE_REGRESSION = 'ola.performance.regression';
