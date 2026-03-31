# AGENTS.md - ola Project Context

## Project Overview

**ola** is an open-source AI agent for the terminal, optimized for code assistance. It helps developers understand large codebases, automate tedious work, and ship faster.

This project is a private fork based on [qwen-code](https://github.com/QwenLM/qwen-code) (Apache 2.0), de-branded and enhanced with additional capabilities.

### Key Features

- **Multi-protocol, OAuth free tier**: Use OpenAI / Anthropic / Gemini-compatible APIs, or sign in with ola OAuth for 1,000 free requests/day
- **Agentic workflow, feature-rich**: Rich built-in tools (Skills, SubAgents, Plan Mode) for a full agentic workflow
- **Terminal-first, IDE-friendly**: Built for developers who live in the command line, with optional integration for VS Code, Zed, and JetBrains IDEs
- **Full Chinese support**: Complete i18n support with Chinese as the primary output language

## Technology Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.3+
- **Package Manager**: npm with workspaces
- **Build Tool**: esbuild
- **Testing**: Vitest
- **Linting**: ESLint + Prettier
- **UI Framework**: Ink (React for CLI)
- **React Version**: 19.x

## Project Structure

```
├── packages/
│   ├── cli/              # Command-line interface (main entry point)
│   ├── core/             # Core backend logic and tool implementations
│   ├── sdk-java/         # Java SDK
│   ├── sdk-typescript/   # TypeScript SDK
│   ├── test-utils/       # Shared testing utilities
│   ├── vscode-ide-companion/  # VS Code extension companion
│   ├── web-templates/    # Web templates (insight reports, HTML export)
│   ├── webui/            # Web UI components
│   └── zed-extension/    # Zed editor extension
├── scripts/              # Build and utility scripts
├── docs/                 # Documentation source
├── docs-site/            # Documentation website (Next.js)
├── integration-tests/    # End-to-end integration tests
└── eslint-rules/         # Custom ESLint rules
```

### Package Details

#### `ola` (packages/cli/)

The main CLI package providing:

- Interactive terminal UI using Ink/React
- Non-interactive/headless mode
- Authentication handling (OAuth, API keys)
- Configuration management
- Command system (`/help`, `/clear`, `/compress`, `/auth`, etc.)
- i18n support with Chinese localization

#### `ola-core` (packages/core/)

Core library containing:

- **Tools**:
  - File operations (read, write, edit, glob, grep, ls)
  - Shell execution with sandbox support
  - Web fetch and web-search
  - LSP integration (diagnostics, hover, go-to-definition)
  - MCP client (Model Context Protocol)
  - Todo management
  - Memory/skill system
  - Agent delegation
- **Subagents**: Task delegation to specialized agents
- **Skills**: Reusable skill system with Markdown + YAML configuration
- **Models**: Model configuration and registry for AI and OpenAI-compatible APIs
- **Services**: Git integration, file discovery, session management, LSP support

## Building and Running

### Prerequisites

- **Node.js**: ~20.19.0 for development (use nvm to manage versions)
- **Git**
- For sandboxing: Docker or Podman (optional but recommended)

### Setup

```bash
# Clone and install
git clone https://github.com/zyzheal/ola.git
cd ola
npm install
```

### Build Commands

```bash
# Build all packages
npm run build

# Build everything including sandbox and VSCode companion
npm run build:all

# Build only packages
npm run build:packages

# Build web-templates (required for bundle)
npm run build:web-templates

# Development mode with hot reload
npm run dev

# Bundle for distribution
npm run bundle
```

### Running

```bash
# Start interactive CLI
npm start

# Or after global installation
ola

# Debug mode
npm run debug

# With environment variables
DEBUG=1 npm start
```

### Testing

```bash
# Run all unit tests
npm run test

# Run integration tests (no sandbox)
npm run test:e2e

# Run all integration tests with different sandbox modes
npm run test:integration:all

# Terminal benchmark tests
npm run test:terminal-bench
```

### Code Quality

```bash
# Run all checks (lint, format, build, test)
npm run preflight

# Lint only
npm run lint
npm run lint:fix

# Format only
npm run format

# Type check
npm run typecheck
```

## Development Conventions

### Code Style

- **Strict TypeScript**: All strict flags enabled (`strictNullChecks`, `noImplicitAny`, etc.)
- **Module System**: ES modules (`"type": "module"`)
- **Import Style**: Node.js native ESM with `.js` extensions in imports
- **No Relative Imports Between Packages**: ESLint enforces this restriction

### Key Configuration Files

- `tsconfig.json`: Base TypeScript configuration with strict settings
- `eslint.config.js`: ESLint flat config with custom rules
- `esbuild.config.js`: Build configuration
- `vitest.config.ts`: Test configuration

### Import Patterns

```typescript
// Within a package - use relative paths
import { something } from './utils/something.js';

// Between packages - use package names
import { Config } from 'ola-core';
```

### Testing Patterns

- Unit tests co-located with source files (`.test.ts` suffix)
- Integration tests in separate `integration-tests/` directory
- Uses Vitest with globals enabled
- Mocking via `msw` for HTTP, `memfs`/`mock-fs` for filesystem

### Architecture Patterns

#### Tools System

All tools extend `BaseDeclarativeTool` or implement the tool interfaces:

- Located in `packages/core/src/tools/`
- Each tool has a corresponding `.test.ts` file
- Tools are registered in the tool registry
- Supports both sync and async execution
- Built-in error handling and retry logic

#### Subagents System

Task delegation framework:

- Configuration stored as Markdown + YAML frontmatter
- Supports both project-level and user-level subagents
- Event-driven architecture for UI updates
- Can be invoked via `/subagent` command or programmatically

#### Skills System

Reusable skill definitions:

- Markdown files with YAML frontmatter
- Located in `~/.ola/skills/` (user) or `.ola/skills/` (project)
- Can include custom prompts, tools, and constraints
- Invoked via `/skill` command

#### Configuration System

Hierarchical configuration loading:

1. Default values
2. User settings (`~/.ola/settings.json`)
3. Project settings (`.ola/settings.json`)
4. Environment variables
5. CLI flags

### Authentication Methods

1. **ola OAuth** (recommended): Browser-based OAuth flow, 1,000 free requests/day
2. **OpenAI-compatible API**: Via `OPENAI_API_KEY` environment variable
3. **Anthropic API**: Claude models support
4. **Google GenAI API**: Gemini models support

Environment variables for API mode:

```bash
export OPENAI_API_KEY="your-api-key"
export OPENAI_BASE_URL="https://api.openai.com/v1"  # optional
export OPENAI_MODEL="gpt-4o"                        # optional

# Or use Dashscope (Alibaba Cloud)
export DASHSCOPE_API_KEY="sk-xxxxx"
```

Configuration via `~/.ola/settings.json`:

```json
{
  "modelProviders": {
    "openai": [
      {
        "id": "qwen3-coder-plus",
        "name": "qwen3-coder-plus",
        "baseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1",
        "description": "Qwen3-Coder via Dashscope",
        "envKey": "DASHSCOPE_API_KEY"
      }
    ]
  },
  "env": {
    "DASHSCOPE_API_KEY": "sk-xxxxxxxxxxxxx"
  }
}
```

## Debugging

### VS Code

Press `F5` to launch with debugger attached, or:

```bash
npm run debug  # Runs with --inspect-brk
```

### React DevTools (for CLI UI)

```bash
DEV=true npm start
npx react-devtools@4.28.5
```

### Sandbox Debugging

```bash
DEBUG=1 ola
```

## Documentation

- User documentation: `./docs/` directory
- Local docs development:

  ```bash
  cd docs-site
  npm install
  npm run link  # Links ../docs to content
  npm run dev   # http://localhost:3000
  ```

## Contributing Guidelines

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines. Key points:

1. Link PRs to existing issues
2. Keep PRs small and focused
3. Use Draft PRs for WIP
4. Ensure `npm run preflight` passes
5. Update documentation for user-facing changes
6. Follow Conventional Commits for commit messages

## Useful Commands Reference

| Command                       | Description                                                          |
| ----------------------------- | -------------------------------------------------------------------- |
| `npm start`                   | Start CLI in interactive mode                                        |
| `npm run dev`                 | Development mode with hot reload                                     |
| `npm run build`               | Build all packages                                                   |
| `npm run build:web-templates` | Build web templates (required before bundle)                         |
| `npm run test`                | Run unit tests                                                       |
| `npm run test:e2e`            | Run integration tests                                                |
| `npm run preflight`           | Full CI check (clean, install, format, lint, build, typecheck, test) |
| `npm run lint`                | Run ESLint                                                           |
| `npm run format`              | Run Prettier                                                         |
| `npm run clean`               | Clean build artifacts                                                |

## Session Commands (within CLI)

- `/help` - Display available commands
- `/clear` - Clear conversation history
- `/compress` - Compress history to save tokens
- `/stats` - Show session information
- `/auth` - Manage authentication
- `/bug` - Submit bug report
- `/exit` or `/quit` - Exit ola

## Recent Changes

### Build System Fixes (2026-03-31)

- Fixed `npm install` failure by adding `build:web-templates` to `prepare` script
- Simplified `.gitignore` to ignore entire `.ola/` directory
- Removed `.ola/` files from git tracking (runtime config/cache directory)
- Removed qwen references from `prepare-package.js` (copyright, description, bin name)

### Key Capabilities

- **File Operations**: Read, write, edit, search (glob/grep), list directories
- **Code Intelligence**: LSP integration for diagnostics, hover, go-to-definition
- **Shell Execution**: With Docker/Podman sandbox support
- **Web Integration**: Web fetch, web-search capabilities
- **MCP Support**: Model Context Protocol for external tool integration
- **Skill System**: Reusable skill definitions with custom prompts
- **Subagent Delegation**: Task delegation to specialized agents
- **Todo Management**: Built-in todo tracking during tasks
- **Memory System**: Persistent memory across sessions
- **Multi-model Support**: OpenAI, Anthropic, Google GenAI, Dashscope compatible

---
