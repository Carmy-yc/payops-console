# PayOps Console

商户支付运营后台项目，用于展示支付场景下的中后台前端能力。

当前项目定位是作品集项目，重点不是接真实支付网关，而是把这几条核心链路做完整：

- 登录鉴权
- RBAC 权限控制
- 图表看板
- 交易列表
- 订单详情
- 退款流程
- 对账页
- 风险告警
- 审计日志

当前代码状态：

- 已完成项目初始化
- 已接入 React 19 + TypeScript + Vite
- 已接入基础路由和页面骨架
- 已接入登录演示页和权限守卫
- 已有各模块占位页
- 已接入基础测试配置

## 项目简介

`PayOps Console` 是一个面向商户运营、财务、风控、审计角色的支付运营后台。

这个项目主要用来展示以下能力：

- 支付类中后台的信息架构设计
- 登录态和权限控制
- 多业务模块拆分
- 复杂列表和详情页的组织方式
- 前端工程化和基础测试能力

当前技术栈：

- React 19
- TypeScript
- Vite
- React Router
- Ant Design
- Vitest
- React Testing Library

## 如何运行项目

### 环境要求

- Node.js `v20.20.2`
- npm

项目根目录提供了 `.nvmrc`，推荐直接使用 `nvm` 切换版本。

### 安装依赖

```bash
cd /Users/carmen/Code/codex/payops-console
nvm use
npm install
```

### 启动开发环境

```bash
cd /Users/carmen/Code/codex/payops-console
nvm use
npm run dev
```

启动后默认访问：

```bash
http://localhost:5173/
```

如果你想让局域网中的其他设备也能访问：

```bash
cd /Users/carmen/Code/codex/payops-console
nvm use
npm run dev -- --host 0.0.0.0
```

### 构建项目

```bash
cd /Users/carmen/Code/codex/payops-console
nvm use
npm run build
```

### 运行测试

```bash
cd /Users/carmen/Code/codex/payops-console
nvm use
npm run test:run
```

## 里程碑

### M0 项目初始化

- [x] 初始化 React + TypeScript + Vite
- [x] 建立基础目录结构
- [x] 接入路由
- [x] 接入全局样式
- [x] 接入基础测试配置

### M1 登录与权限骨架

- [x] 登录页
- [x] 演示账号
- [x] 路由守卫
- [x] 菜单级权限控制
- [x] 403 / 404 页面

### M2 看板与交易模块

- [x] 看板静态骨架
- [ ] 交易列表筛选区
- [ ] 交易表格
- [ ] 订单详情真实内容

### M3 退款模块

- [ ] 退款列表
- [ ] 发起退款
- [ ] 大额退款审核
- [ ] 状态流转

### M4 对账模块

- [ ] 对账汇总
- [ ] 差异订单列表
- [ ] 差异处理动作

### M5 风险模块

- [ ] 风险告警列表
- [ ] 告警详情
- [ ] 处理动作

### M6 审计模块

- [ ] 审计日志查询
- [ ] 操作检索

### M7 测试与收尾

- [ ] 登录流程测试
- [ ] 权限测试
- [ ] 核心业务冒烟测试

## 如何提交到 GitHub

如果仓库还没有初始化，可以按下面的方式操作：

```bash
cd /Users/carmen/Code/codex/payops-console
git init -b main
git add .
git commit -m "feat: bootstrap payops console with auth and routing skeleton"
```

如果你已经在 GitHub 上创建好了空仓库，再执行：

```bash
git remote add origin https://github.com/<your-name>/payops-console.git
git push -u origin main
```

如果远端仓库已经有初始提交，比如你在 GitHub 上勾选了 `README`、`LICENSE` 或 `.gitignore`，先执行：

```bash
git pull --no-rebase origin main --allow-unrelated-histories
git push -u origin main
```

如果只是日常继续提交，流程会更简单：

```bash
git add .
git commit -m "feat: xxx"
git push
```
