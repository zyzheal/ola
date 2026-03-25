# OLA 信任命令配置指南

## 问题说明

使用 OLA 时，如果每次执行常见命令（如 `find`, `grep`, `git` 等）都需要确认，会影响工作效率。

## 解决方案

### 方法一：全局配置（推荐）

编辑全局配置文件 `~/.ola/settings.json`：

```json
{
  "trustedCommands": {
    "patterns": [
      "npm run *",
      "npm install",
      "npm ci",
      "npm run build",
      "npm run test",
      "node scripts/*.js",
      "find *",
      "grep *",
      "sed *",
      "git *",
      "ls *",
      "cat *",
      "head *",
      "tail *",
      "wc *",
      "chmod *",
      "mkdir *",
      "cp *",
      "mv *",
      "rm *",
      "touch *"
    ],
    "enabled": true
  }
}
```

### 方法二：项目级配置

在项目目录创建 `.ola/settings.json`：

```bash
# 在项目根目录执行
mkdir -p .ola
cat > .ola/settings.json << 'EOF'
{
  "trustedCommands": {
    "patterns": [
      "find *",
      "grep *",
      "sed *",
      "git *",
      "npm *",
      "node *"
    ],
    "enabled": true
  }
}
EOF
```

### 方法三：交互式配置

在 OLA 会话中：

```bash
ola
> /settings
```

然后编辑 `trustedCommands` 配置。

## 配置说明

### trustedCommands.patterns

命令模式列表，支持通配符 `*`：

- `"find *"` - 所有 find 命令
- `"git *"` - 所有 git 命令
- `"npm run *"` - 所有 npm run 命令
- `"node scripts/*.js"` - 运行 scripts 目录下的 JS 文件

### trustedCommands.enabled

- `true` - 启用信任命令（不询问）
- `false` - 禁用（每次询问）

## 安全建议

### ✅ 推荐信任的命令

```json
{
  "patterns": [
    "find *",
    "grep *",
    "ls *",
    "cat *",
    "head *",
    "tail *",
    "wc *",
    "git status",
    "git diff",
    "git log",
    "npm run build",
    "npm run test"
  ]
}
```

### ⚠️ 谨慎信任的命令

```json
{
  "patterns": [
    "rm -rf *", // 危险：删除文件
    "git push *", // 可能意外推送
    "npm publish", // 发布包
    "chmod 777 *" // 权限设置
  ]
}
```

## 验证配置

```bash
# 检查配置文件
cat ~/.ola/settings.json

# 测试 OLA 是否还会询问
ola -p "查找所有 TypeScript 文件"
```

## 常见问题

### Q: 配置后仍然询问？

**A**: 检查：

1. 配置文件路径是否正确
2. JSON 格式是否有效
3. `enabled` 是否为 `true`
4. 命令模式是否匹配

### Q: 如何撤销信任？

**A**: 编辑配置文件，设置 `"enabled": false` 或删除特定模式。

### Q: 项目配置和全局配置的优先级？

**A**: 项目配置（`.ola/settings.json`）优先级高于全局配置（`~/.ola/settings.json`）。

## 示例配置

### 开发人员配置

```json
{
  "trustedCommands": {
    "patterns": [
      "git *",
      "npm *",
      "node *",
      "find * -name '*.ts'",
      "grep -r *",
      "npm run dev",
      "npm run build",
      "npm run test"
    ],
    "enabled": true
  }
}
```

### DevOps 配置

```json
{
  "trustedCommands": {
    "patterns": [
      "kubectl *",
      "docker *",
      "helm *",
      "terraform *",
      "ansible *",
      "ssh *",
      "scp *"
    ],
    "enabled": true
  }
}
```

### 安全优先配置

```json
{
  "trustedCommands": {
    "patterns": ["ls *", "cat *", "head *", "tail *", "git status", "git diff"],
    "enabled": true
  }
}
```

## 相关文档

- [OLA 配置说明](./configuration/settings.md)
- [OLA 使用指南](./USAGE.md)
