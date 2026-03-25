# AI Platform Code Assistant Companion

Seamlessly integrate AI Platform Code Assistant into Visual Studio Code with native IDE features and an intuitive chat interface. This extension bundles everything you need — no additional installation required.

## Demo

<video src="https://cloud.video.taobao.com/vod/IKKwfM-kqNI3OJjM_U8uMCSMAoeEcJhs6VNCQmZxUfk.mp4" controls width="800">
  Your browser does not support the video tag. You can open the video directly:
  https://cloud.video.taobao.com/vod/IKKwfM-kqNI3OJjM_U8uMCSMAoeEcJhs6VNCQmZxUfk.mp4
</video>

## Features

- **Native IDE experience**: Dedicated Qwen Code Chat panel accessed via the Qwen icon in the editor title bar
- **Native diffing**: Review, edit, and accept changes in VS Code's diff view
- **Auto-accept edits mode**: Automatically apply Qwen's changes as they're made
- **File management**: @-mention files or attach files and images using the system file picker
- **Conversation history & multiple sessions**: Access past conversations and run multiple sessions simultaneously
- **Open file & selection context**: Share active files, cursor position, and selections for more precise help

## Requirements

- Visual Studio Code 1.85.0 or newer (also works with Cursor, Windsurf, and other VS Code-based editors)

## Quick Start

1. **Install** from the VS Code Marketplace or Open VSX Registry

2. **Open the Chat panel** using one of these methods:
   - Click the **AI Platform icon** in the top-right corner of the editor
   - Run `AI Platform Code Assistant: Open` from the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)

3. **Start chatting** — Ask the assistant to help with coding tasks, explain code, fix bugs, or write new features

## Commands

| Command                                           | Description                                            |
| ------------------------------------------------- | ------------------------------------------------------ |
| `AI Platform Code Assistant: Open`                | Open the AI Platform Code Assistant Chat panel         |
| `AI Platform Code Assistant: Run`                 | Launch a classic terminal session with the bundled CLI |
| `AI Platform Code Assistant: Accept Current Diff` | Accept the currently displayed diff                    |
| `AI Platform Code Assistant: Close Diff Editor`   | Close/reject the current diff                          |

## Feedback & Issues

- 🐛 Report bugs
- 💡 Request features
- 📖 Documentation: `./docs/` directory
- 📋 Changelog: See CHANGELOG.md

## Contributing

We welcome contributions! See our [Contributing Guide](./CONTRIBUTING.md) for details on:

- Setting up the development environment
- Building and debugging the extension locally
- Submitting pull requests

## Terms of Service and Privacy Notice

By installing this extension, you agree to the project's Terms of Service and Privacy Notice.

## License

[Apache-2.0](./LICENSE)
