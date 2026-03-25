# OLA DevOps/SRE Agent & Skills 实现方案

## 一、当前系统能力分析

### 1.1 Subagent 机制

**特点**：

- ✅ 支持多 Agent 协作
- ✅ 每个 Agent 有独立的 system prompt
- ✅ 可以限制工具使用范围
- ✅ 支持任务委派和结果返回
- ✅ 内置 Agent：`general-purpose`, `Explore`

**适用场景**：

- 复杂任务分解
- 专业化任务处理
- 并行任务执行

### 1.2 Skills 机制

**特点**：

- ✅ 基于 Markdown 文件配置（`SKILL.md`）
- ✅ 支持 YAML frontmatter 元数据
- ✅ 可以指定允许使用的工具
- ✅ 支持项目级、用户级、扩展级
- ✅ 内置 Skill：`review`

**适用场景**：

- 标准化操作流程
- 最佳实践沉淀
- 知识复用

---

## 二、DevOps/SRE Agent 设计方案

### 2.1 内置 Agent 列表

```typescript
// packages/core/src/subagents/builtin-agents.ts

const DEVOPS_AGENTS = [
  {
    name: 'k8s-operator',
    description:
      'Kubernetes 运维专家，擅长 Pod、Deployment、Service 等资源管理',
    systemPrompt: `你是 Kubernetes 运维专家...`,
    tools: [ToolNames.SHELL, 'k8s-get', 'k8s-apply', 'k8s-logs'],
  },
  {
    name: 'sre-oncall',
    description: 'SRE 值班工程师，擅长故障排查和告警响应',
    systemPrompt: `你是 SRE 值班工程师...`,
    tools: [ToolNames.SHELL, ToolNames.GREP, 'prometheus-query', 'loki-query'],
  },
  {
    name: 'cicd-engineer',
    description: 'CI/CD 工程师，擅长流水线配置和部署',
    systemPrompt: `你是 CI/CD 工程师...`,
    tools: [ToolNames.SHELL, ToolNames.READ_FILE, ToolNames.WRITE_FILE],
  },
  {
    name: 'security-auditor',
    description: '安全审计员，擅长安全配置检查和漏洞扫描',
    systemPrompt: `你是安全审计员...`,
    tools: [ToolNames.SHELL, ToolNames.GREP, ToolNames.READ_FILE],
  },
];
```

### 2.2 Agent 详细设计

#### K8s Operator Agent

```markdown
# K8s Operator Agent

## 职责

- Kubernetes 集群管理
- 资源状态检查
- 故障诊断和恢复
- 配置变更和部署

## 可用工具

- kubectl 命令（通过 shell）
- k8s-get-resource
- k8s-apply
- k8s-describe
- k8s-logs
- k8s-events

## 操作规范

1. 执行变更前必须确认命名空间和环境
2. 删除操作需要二次确认
3. 所有操作必须记录审计日志
4. 优先使用声明式配置

## 典型任务

- "检查 production 命名空间下所有 Pod 的状态"
- "重启 deployment/api-gateway"
- "查看 pod/nginx-xxx 的日志"
- "应用这个 Kubernetes 配置文件"
```

#### SRE Oncall Agent

```markdown
# SRE Oncall Agent

## 职责

- 告警响应和处理
- 故障诊断和恢复
- 监控指标分析
- 事故报告生成

## 可用工具

- prometheus-query
- grafana-dashboard
- alertmanager-query
- loki-query
- log-pattern
- ToolNames.SHELL
- ToolNames.GREP

## 操作流程

1. 接收告警 → 确认影响范围
2. 收集信息 → 指标、日志、链路
3. 定位根因 → 分析关联关系
4. 执行恢复 → 重启、回滚、扩容
5. 生成报告 → 事故总结

## 典型任务

- "处理 API 错误率告警"
- "分析过去 1 小时的错误日志"
- "查询核心服务的 SLO 状态"
- "生成事故诊断报告"
```

#### CI/CD Engineer Agent

```markdown
# CI/CD Engineer Agent

## 职责

- 流水线配置和管理
- 构建和部署执行
- 发布和回滚操作
- 环境管理

## 可用工具

- github-actions / gitlab-ci
- pipeline-status
- deployment-history
- ToolNames.SHELL
- ToolNames.READ_FILE
- ToolNames.WRITE_FILE

## 操作规范

1. 部署前检查测试状态
2. 生产环境部署需要审批
3. 保留所有部署记录
4. 支持快速回滚

## 典型任务

- "触发 production 环境的部署"
- "查看最近的构建失败原因"
- "回滚到上一个稳定版本"
- "配置新的 CI 流水线"
```

---

## 三、DevOps/SRE Skills 设计方案

### 3.1 Skills 目录结构

```
~/.ola/skills/
├── devops/
│   ├── k8s-troubleshoot/
│   │   └── SKILL.md          # K8s 故障排查技能
│   ├── log-analysis/
│   │   └── SKILL.md          # 日志分析技能
│   ├── incident-response/
│   │   └── SKILL.md          # 事故响应技能
│   └── deployment/
│       └── SKILL.md          # 部署操作技能
└── sre/
    ├── slo-monitoring/
    │   └── SKILL.md          # SLO 监控技能
    ├── capacity-planning/
    │   └── SKILL.md          # 容量规划技能
    └── chaos-engineering/
        └── SKILL.md          # 混沌工程技能
```

### 3.2 Skill 示例

#### K8s 故障排查技能

````markdown
---
name: k8s-troubleshoot
description: Kubernetes 故障排查标准化流程
allowedTools:
  - shell
  - k8s-get
  - k8s-describe
  - k8s-logs
  - k8s-events
  - grep
  - read-file
---

# Kubernetes 故障排查技能

## 适用场景

- Pod 无法启动
- 服务无法访问
- 资源使用异常
- 网络连通性问题

## 排查流程

### 1. 收集基本信息

```bash
# 查看 Pod 状态
kubectl get pods -n {{namespace}} -o wide

# 查看事件
kubectl get events -n {{namespace}} --sort-by='.lastTimestamp'

# 查看资源使用
kubectl top pods -n {{namespace}}
```
````

### 2. 分析 Pod 状态

根据 Pod 状态采取不同策略：

- **Pending**: 检查资源配额、节点选择器
- **ContainerCreating**: 检查镜像拉取、存储挂载
- **CrashLoopBackOff**: 查看日志、检查配置
- **Error**: 查看日志、分析退出码
- **OOMKilled**: 检查内存限制、分析内存使用

### 3. 查看详细日志

```bash
# 查看容器日志
kubectl logs {{pod-name}} -n {{namespace}} --tail=100

# 查看上一个实例的日志（如果是重启）
kubectl logs {{pod-name}} -n {{namespace}} --previous
```

### 4. 检查依赖服务

```bash
# 测试网络连通性
kubectl exec {{pod-name}} -n {{namespace}} -- nc -zv {{service}} {{port}}

# 检查 DNS 解析
kubectl exec {{pod-name}} -n {{namespace}} -- nslookup {{service}}
```

### 5. 生成诊断报告

输出包含：

- 问题概述
- 影响范围
- 根因分析
- 解决方案
- 预防措施

## 输出模板

```markdown
## K8s 故障诊断报告

### 问题概述

[描述问题现象]

### 影响范围

- 命名空间：{{namespace}}
- 受影响资源：[列表]
- 影响时间：[时长]

### 诊断过程

1. [步骤 1]
2. [步骤 2]
   ...

### 根因分析

[分析结果]

### 解决方案

[具体措施]

### 预防措施

[改进建议]
```

## 注意事项

1. 生产环境操作前必须备份
2. 删除操作需要二次确认
3. 所有操作记录审计日志
4. 重大故障及时升级上报

````

#### 日志分析技能

```markdown
---
name: log-analysis
description: 标准化日志分析流程和方法
allowedTools:
  - shell
  - grep
  - ripGrep
  - loki-query
  - elasticsearch-query
  - read-file
---

# 日志分析技能

## 适用场景
- 错误日志分析
- 性能问题排查
- 安全事件调查
- 用户行为分析

## 分析方法

### 1. 关键词搜索

```bash
# 搜索错误日志
grep -r "ERROR\|FATAL\|Exception" /var/log/{{service}}/

# 搜索特定时间范围
grep "2025-03-25 1[0-9]:" /var/log/{{service}}/app.log

# 统计错误数量
grep -c "ERROR" /var/log/{{service}}/app.log
````

### 2. 模式识别

常见错误模式：

- 连接超时：`timeout|connection refused`
- 内存溢出：`OutOfMemory|OOM`
- 认证失败：`401|403|Unauthorized`
- 数据库错误：`SQL|database|connection pool`

### 3. 趋势分析

```bash
# 按小时统计错误数
grep "ERROR" /var/log/{{service}}/app.log | \
  cut -d' ' -f1-2 | cut -d':' -f1 | uniq -c

# 错误类型分布
grep "ERROR" /var/log/{{service}}/app.log | \
  grep -oE "\[[A-Z_]+\]" | sort | uniq -c | sort -rn
```

### 4. 关联分析

- 时间关联：同一时间点的多个错误
- 链路关联：TraceID 关联的完整链路
- 因果关联：错误前后的操作序列

## 输出报告

```markdown
## 日志分析报告

### 时间范围

[开始时间] - [结束时间]

### 错误统计

- 总错误数：[数量]
- 错误类型分布：[列表]
- 错误趋势：[上升/下降/平稳]

### 主要问题

1. [问题 1] - [影响] - [频次]
2. [问题 2] - [影响] - [频次]

### 根因分析

[分析结果]

### 建议措施

[具体建议]
```

````

---

## 四、实现方案

### 4.1 方案对比

| 方案 | 优点 | 缺点 | 实施难度 | 推荐度 |
|------|------|------|---------|--------|
| **新增 Agent** | 专业化强、可独立执行 | 需要修改代码 | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **新增 Skills** | 配置简单、易扩展 | 依赖现有工具 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **MCP 集成** | 快速接入第三方 | 依赖外部服务 | ⭐⭐ | ⭐⭐⭐⭐ |
| **工具增强** | 功能强大、灵活 | 开发成本高 | ⭐⭐⭐⭐ | ⭐⭐⭐ |

### 4.2 推荐实施方案

#### 阶段一：Skills 先行（1 周）

**优势**：
- ✅ 无需修改核心代码
- ✅ 配置简单，快速上线
- ✅ 易于测试和迭代
- ✅ 用户可自定义扩展

**实施步骤**：

```bash
# 1. 创建 Skills 目录结构
mkdir -p ~/.ola/skills/devops/{k8s-troubleshoot,log-analysis,incident-response}
mkdir -p ~/.ola/skills/sre/{slo-monitoring,capacity-planning}

# 2. 创建 Skill 配置文件
# 参考上面的 SKILL.md 模板

# 3. 测试 Skill
ola
> /skills list
> /skills use k8s-troubleshoot
````

#### 阶段二：Agent 增强（2 周）

**实施步骤**：

```typescript
// packages/core/src/subagents/builtin-agents.ts

export const DEVOPS_AGENTS: SubagentConfig[] = [
  {
    name: 'k8s-operator',
    description: 'Kubernetes 运维专家',
    systemPrompt: `...`, // 见上方详细设计
    tools: [
      ToolNames.SHELL,
      ToolNames.READ_FILE,
      ToolNames.GREP,
      // 后续集成的工具
      // 'k8s-get',
      // 'k8s-apply',
    ],
  },
  // ... 其他 Agent
];

// 在 BuiltinAgentRegistry 中注册
```

#### 阶段三：工具集成（3-4 周）

开发专用工具：

```typescript
// packages/core/src/tools/k8s/k8s-get.ts

import { BaseDeclarativeTool } from '../base-declarative-tool.js';

export class K8sGetResourceTool extends BaseDeclarativeTool {
  constructor() {
    super('k8s-get', '获取 Kubernetes 资源', {
      resourceType: 'string (required): pod, deployment, service, etc.',
      namespace: 'string (optional): 命名空间，默认 default',
      name: 'string (optional): 资源名称',
    });
  }

  protected async execute(params: any): Promise<ToolResult> {
    const { resourceType, namespace = 'default', name } = params;

    // 执行 kubectl get 命令
    const command = `kubectl get ${resourceType} ${name || ''} -n ${namespace} -o yaml`;

    // 返回结果
    return {
      content: output,
      isError: false,
    };
  }
}
```

---

## 五、快速开始

### 5.1 立即可用的 Skills

创建第一个 DevOps Skill：

````bash
# 1. 创建目录
mkdir -p ~/.ola/skills/devops/k8s-check

# 2. 创建 SKILL.md
cat > ~/.ola/skills/devops/k8s-check/SKILL.md << 'EOF'
---
name: k8s-check
description: Kubernetes 健康检查
allowedTools:
  - shell
  - grep
---

# Kubernetes 健康检查技能

## 检查项

### 1. Pod 状态检查
\`\`\`bash
kubectl get pods --all-namespaces -o wide | grep -v Running
\`\`\`

### 2. 节点状态检查
\`\`\`bash
kubectl get nodes
\`\`\`

### 3. 资源使用检查
\`\`\`bash
kubectl top nodes
kubectl top pods --all-namespaces
\`\`\`

### 4. 事件检查
\`\`\`bash
kubectl get events --all-namespaces --sort-by='.lastTimestamp' | tail -20
\`\`\`

## 输出报告

```markdown
## K8s 健康检查报告

### 检查时间
[时间]

### Pod 状态
- Running: [数量]
- 异常 Pod: [列表]

### 节点状态
- Ready: [数量]
- 异常节点：[列表]

### 资源使用
- CPU 使用率：[范围]
- 内存使用率：[范围]

### 重要事件
[列表]

### 建议
[改进建议]
````

EOF

# 3. 使用 Skill

ola

> /skills list
> /skills use k8s-check

````

### 5.2 使用示例

```bash
# 使用 K8s 检查技能
ola -p "使用 k8s-check 技能检查集群健康状态"

# 使用日志分析技能
ola -p "使用 log-analysis 技能分析昨天的错误日志"

# 调用 K8s Operator Agent
ola -p "让 k8s-operator 检查 production 命名空间的 Pod 状态"
````

---

## 六、最佳实践

### 6.1 Skill 开发规范

1. **明确职责边界**
   - 每个 Skill 聚焦一个具体场景
   - 定义清晰的输入输出
   - 列出前置条件

2. **标准操作流程**
   - 步骤清晰、可执行
   - 包含验证方法
   - 提供回滚方案

3. **安全考虑**
   - 危险操作需要确认
   - 记录审计日志
   - 权限最小化

### 6.2 Agent 协作模式

```
用户请求
  ↓
主 Agent 分析
  ↓
任务分解 → K8s Operator → 检查资源
         ↓
    SRE Oncall → 分析指标
         ↓
    汇总结果 → 用户
```

---

## 七、总结

### 推荐实施路径

```
Week 1-2: Skills 开发
  ├── k8s-troubleshoot
  ├── log-analysis
  └── incident-response

Week 3-4: Agent 开发
  ├── k8s-operator
  ├── sre-oncall
  └── cicd-engineer

Week 5-8: 工具集成
  ├── k8s-* tools
  ├── prometheus-* tools
  └── cicd-* tools
```

### 预期效果

| 指标         | 当前     | 实施后  | 提升 |
| ------------ | -------- | ------- | ---- |
| 故障排查时间 | 30-60min | 5-10min | 85%  |
| 标准化程度   | 低       | 高      | -    |
| 知识沉淀     | 困难     | 容易    | -    |
| 新人上手     | 1-2 周   | 1-2 天  | 85%  |

---

**文档维护**: DevOps Tooling Team
**反馈**: 创建 Issue 或参与讨论
