# Sandbox

This document explains how to run OLA inside a sandbox to reduce risk when tools execute shell commands or modify files.

## Prerequisites

Before using sandboxing, you need to install and set up OLA:

```bash
npm install -g ola
```

To verify the installation

```bash
ola --version
```

## Overview of sandboxing

Sandboxing isolates potentially dangerous operations (such as shell commands or file modifications) from your host system, providing a security barrier between the CLI and your environment.

The benefits of sandboxing include:

- **Security**: Prevent accidental system damage or data loss.
- **Isolation**: Limit file system access to project directory.
- **Consistency**: Ensure reproducible environments across different systems.
- **Safety**: Reduce risk when working with untrusted code or experimental commands.

> [!note]
>
> **Environment Variable Prefix:**
>
> - New environment variables use the `OLA_*` prefix (e.g., `OLA_SANDBOX`, `OLA_SANDBOX_IMAGE`)
> - For backward compatibility, the `QWEN_*` prefix is also supported during the transition period

## Sandboxing methods

Your ideal method of sandboxing may differ depending on your platform and your preferred container solution.

### 1. macOS Seatbelt (macOS only)

Lightweight, built-in sandboxing using `sandbox-exec`.

**Default profile**: `permissive-open` - restricts writes outside the project directory, but allows most other operations and outbound network access.

**Best for**: Fast, no Docker required, strong guardrails for file writes.

### 2. Container-based (Docker/Podman)

Cross-platform sandboxing with complete process isolation.

By default, OLA uses a published sandbox image (configured in the CLI package) and will pull it as needed.

The container sandbox mounts your workspace and your `~/.ola` directory into the container so auth and settings persist between runs.

**Best for**: Strong isolation on any OS, consistent tooling inside a known image.

### Choosing a method

- **On macOS**:
  - Use Seatbelt when you want lightweight sandboxing (recommended for most users).
  - Use Docker/Podman when you need a full Linux userland (e.g., tools that require Linux binaries).
- **On Linux/Windows**:
  - Use Docker or Podman.

## Quickstart

```bash
# Enable sandboxing with command flag
ola -s -p "analyze the code structure"

# Or enable sandboxing for your shell session (recommended for CI / scripts)
export OLA_SANDBOX=true   # true auto-picks a provider (see notes below)
ola -p "run the test suite"

# Configure in settings.json
{
  "tools": {
    "sandbox": true
  }
}
```

> [!tip]
>
> **Provider selection notes:**
>
> - On **macOS**, `OLA_SANDBOX=true` typically selects `sandbox-exec` (Seatbelt) if available.
> - On **Linux/Windows**, `OLA_SANDBOX=true` requires `docker` or `podman` to be installed.
> - To force a provider, set `OLA_SANDBOX=docker|podman|sandbox-exec`.

## Configuration

### Enable sandboxing (in order of precedence)

1. **Environment variable**: `OLA_SANDBOX=true|false|docker|podman|sandbox-exec` (or `QWEN_SANDBOX` for backward compatibility)
2. **Command flag / argument**: `-s`, `--sandbox`, or `--sandbox=<provider>`
3. **Settings file**: `tools.sandbox` in your `settings.json` (e.g., `{"tools": {"sandbox": true}}`).

> [!important]
>
> If `OLA_SANDBOX` (or `QWEN_SANDBOX`) is set, it **overrides** the CLI flag and `settings.json`.

### Configure the sandbox image (Docker/Podman)

- **CLI flag**: `--sandbox-image <image>`
- **Environment variable**: `OLA_SANDBOX_IMAGE=<image>` (or `QWEN_SANDBOX_IMAGE` for backward compatibility)

If you don't set either, OLA uses the default image configured in the CLI package (for example `ghcr.io/your-org/ola:<version>`).

### macOS Seatbelt profiles

Built-in profiles (set via `SEATBELT_PROFILE` env var):

- `permissive-open` (default): Write restrictions, network allowed
- `permissive-closed`: Write restrictions, no network
- `permissive-proxied`: Write restrictions, network via proxy
- `restrictive-open`: Strict restrictions, network allowed
- `restrictive-closed`: Maximum restrictions
- `restrictive-proxied`: Strict restrictions, network via proxy

> [!tip]
>
> Start with `permissive-open`, then tighten to `restrictive-closed` if your workflow still works.

### Custom Seatbelt profiles (macOS)

To use a custom Seatbelt profile:

1. Create a file named `.ola/sandbox-macos-<profile_name>.sb` in your project.
2. Set `SEATBELT_PROFILE=<profile_name>`.

### Custom Sandbox Flags

For container-based sandboxing, you can inject custom flags into the `docker` or `podman` command using the `SANDBOX_FLAGS` environment variable. This is useful for advanced configurations, such as disabling security features for specific use cases.

**Example (Podman)**:

To disable SELinux labeling for volume mounts, you can set the following:

```bash
export SANDBOX_FLAGS="--security-opt label=disable"
```

Multiple flags can be provided as a space-separated string:

```bash
export SANDBOX_FLAGS="--flag1 --flag2=value"
```

### Network proxying (all sandbox methods)

If you want to restrict outbound network access to an allowlist, you can run a local proxy alongside the sandbox:

- Set `OLA_SANDBOX_PROXY_COMMAND=<command>`
- The command must start a proxy server that listens on `:::8877`

This is especially useful with `*-proxied` Seatbelt profiles.

For a working allowlist-style proxy example, see: [Example Proxy Script](/developers/examples/proxy-script).

## Linux UID/GID handling

On Linux, OLA defaults to enabling UID/GID mapping so the sandbox runs as your user (and reuses the mounted `~/.ola`). Override with:

```bash
export SANDBOX_SET_UID_GID=true   # Force host UID/GID
export SANDBOX_SET_UID_GID=false  # Disable UID/GID mapping
```

## Troubleshooting

### Common issues

**"Operation not permitted"**

- Operation requires access outside sandbox.
- On macOS Seatbelt: try a more permissive `SEATBELT_PROFILE`.
- On Docker/Podman: verify the workspace is mounted and your command doesn’t require access outside the project directory.

**Missing commands**

- Container sandbox: add them via `.ola/sandbox.Dockerfile` or `.ola/sandbox.bashrc`.
- Seatbelt: your host binaries are used, but the sandbox may restrict access to some paths.

**Java not available in Docker sandbox**

The official OLA Docker image is intentionally minimal to keep the image small, secure, and fast to pull. Different users require different language runtimes (Java, Python, Node.js, etc.), and bundling all environments into a single image is not practical. Therefore, Java is **not included by default** in the Docker sandbox.

If your workflow requires Java, you can extend the base image by creating a `.ola/sandbox.Dockerfile` in your project:

```dockerfile
FROM ghcr.io/qwenlm/ola:latest

RUN apt-get update && \
    apt-get install -y openjdk-17-jre && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

Then rebuild the sandbox image:

```bash
OLA_SANDBOX=docker BUILD_SANDBOX=1 ola -s
```

For more details on customizing the sandbox, see [Customizing the sandbox environment](/developers/tools/sandbox).

**Network issues**

- Check sandbox profile allows network.
- Verify proxy configuration.

### Debug mode

```bash
DEBUG=1 ola -s -p "debug command"
```

**Note:** If you have `DEBUG=true` in a project's `.env` file, it won't affect the CLI due to automatic exclusion. Use `.ola/.env` files for OLA-specific debug settings.

### Inspect sandbox

```bash
# Check environment
ola -s -p "run shell command: env | grep SANDBOX"

# List mounts
ola -s -p "run shell command: mount | grep workspace"
```

## Security notes

- Sandboxing reduces but doesn't eliminate all risks.
- Use the most restrictive profile that allows your work.
- Container overhead is minimal after the first pull/build.
- GUI applications may not work in sandboxes.

## Related documentation

- [Configuration](../configuration/settings): Full configuration options.
- [Commands](../features/commands): Available commands.
- [Troubleshooting](../support/troubleshooting): General troubleshooting.
- [Language Settings](../configuration/language): How to change the interface language.

---

## Language / 语言设置

By default, OLA uses **Chinese (中文)** as the interface language.

To change the language, set the `OLA_CODE_LANG` environment variable:

```bash
# English
export OLA_CODE_LANG=en

# Chinese (default)
export OLA_CODE_LANG=zh

# Japanese
export OLA_CODE_LANG=ja

# German
export OLA_CODE_LANG=de

# Portuguese
export OLA_CODE_LANG=pt

# Russian
export OLA_CODE_LANG=ru
```

Or configure in `settings.json`:

```json
{
  "general": {
    "language": "zh"
  }
}
```

**Supported languages / 支持的语言:**

- `zh` - 中文 (Chinese) - **Default / 默认**
- `en` - English
- `ja` - 日本語 (Japanese)
- `de` - Deutsch (German)
- `pt` - Português (Portuguese)
- `ru` - Русский (Russian)
