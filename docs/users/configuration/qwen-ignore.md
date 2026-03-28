# Ignoring Files

This document provides an overview of the Qwen Ignore (`.olaignore`) feature of OLA.

OLA includes the ability to automatically ignore files, similar to `.gitignore` (used by Git). Adding paths to your `.olaignore` file will exclude them from tools that support this feature, although they will still be visible to other services (such as Git).

## How it works

When you add a path to your `.olaignore` file, tools that respect this file will exclude matching files and directories from their operations. For example, when you use the [`read_many_files`](../../developers/tools/multi-file) command, any paths in your `.olaignore` file will be automatically excluded.

For the most part, `.olaignore` follows the conventions of `.gitignore` files:

- Blank lines and lines starting with `#` are ignored.
- Standard glob patterns are supported (such as `*`, `?`, and `[]`).
- Putting a `/` at the end will only match directories.
- Putting a `/` at the beginning anchors the path relative to the `.olaignore` file.
- `!` negates a pattern.

You can update your `.olaignore` file at any time. To apply the changes, you must restart your OLA session.

## How to use `.olaignore`

| Step                  | Description                                                                           |
| --------------------- | ------------------------------------------------------------------------------------- |
| **Enable .olaignore** | Create a file named `.olaignore` in your project root directory                       |
| **Add ignore rules**  | Open `.olaignore` file and add paths to ignore, example: `/archive/` or `apikeys.txt` |

### `.olaignore` examples

You can use `.olaignore` to ignore directories and files:

```
# Exclude your /packages/ directory and all subdirectories
/packages/

# Exclude your apikeys.txt file
apikeys.txt
```

You can use wildcards in your `.olaignore` file with `*`:

```
# Exclude all .md files
*.md
```

Finally, you can exclude files and directories from exclusion with `!`:

```
# Exclude all .md files except README.md
*.md
!README.md
```

To remove paths from your `.olaignore` file, delete the relevant lines.
