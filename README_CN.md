# AI 3D CAD Studio

基于 OpenCascade.js 的 AI 驱动在线 CAD 建模工具，支持自然语言生成 3D 模型。

## 🎯 主要功能

### ✅ 已完成的功能

1. **Tab 页面布局** - 代码编辑器与 3D 视图通过 Tab 切换，节省屏幕空间
2. **AI 代码生成** - 使用 DeepSeek API，通过自然语言描述生成 3D 模型代码
3. **用户认证系统** - 基于 Supabase 的用户注册、登录功能
4. **积分系统** - 
   - 新用户注册赠送 100 积分
   - AI 生成按 token 消耗积分
   - 积分不足需要充值
   - 完整的消费记录
5. **优化的菜单** - 分类清晰的文件、导出、导入菜单
6. **响应式设计** - 完美适配桌面端和移动端
7. **工程软件配色** - 采用类似 AutoCAD/SolidWorks 的深色专业配色

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Supabase

#### 2.1 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com/) 并创建账户
2. 创建新项目
3. 获取项目的 URL 和 anon key

#### 2.2 创建数据库表

在 Supabase SQL 编辑器中执行以下 SQL：

```sql
-- 用户积分表
CREATE TABLE user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  credits DECIMAL(10, 2) DEFAULT 100.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 积分交易记录表
CREATE TABLE credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  balance_after DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- 启用行级安全策略 (RLS)
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- 用户只能查看和更新自己的积分
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON user_credits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits" ON user_credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能查看自己的交易记录
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 创建触发器自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 3. 配置 DeepSeek API

1. 访问 [DeepSeek](https://platform.deepseek.com/) 注册账户
2. 获取 API Key

### 4. 更新配置文件

编辑 `js/config.js` 文件，填入你的配置信息：

```javascript
const CONFIG = {
    // Supabase 配置
    SUPABASE_URL: 'https://your-project.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key',
    
    // DeepSeek API 配置
    DEEPSEEK_API_KEY: 'your-deepseek-api-key',
    DEEPSEEK_API_URL: 'https://api.deepseek.com/v1/chat/completions',
    
    // 积分配置
    INITIAL_CREDITS: 100,
    CREDITS_PER_TOKEN: 0.01
};
```

### 5. 启动应用

```bash
# 使用简单的 HTTP 服务器
npx http-server -p 8080

# 或使用 Python
python -m http.server 8080

# 或使用 Node.js
npx serve
```

然后在浏览器中访问 `http://localhost:8080`

## 📱 使用说明

### AI 生成 3D 模型

1. **注册/登录** - 点击右上角的"注册"或"登录"按钮
2. **输入描述** - 在顶部的 AI 输入框中用自然语言描述你想要的 3D 模型
   - 例如："创建一个带圆孔的立方体"
   - 例如："生成一个齿轮，半径50，齿数20"
3. **点击生成** - AI 将自动生成代码并渲染 3D 模型
4. **查看积分** - 右上角显示剩余积分，每次生成会根据 token 消耗扣除

### 手动编写代码

1. 切换到"代码编辑器" Tab
2. 编写或修改 TypeScript 代码
3. 按 F5 或 Ctrl+S 评估代码
4. 切换到"3D 视图" Tab 查看结果

### 导出模型

使用顶部菜单的"导出"选项：
- **STEP** - 工业标准格式，适合 CAD 软件
- **STL** - 3D 打印常用格式
- **OBJ** - 通用 3D 模型格式

### 用户中心

点击右上角"用户中心"查看：
- 当前积分余额
- 消费记录
- 充值选项（开发中）

## 🎨 支持的 CAD 函数

### 基础形状
- `Box(width, height, depth, centered)` - 长方体
- `Sphere(radius)` - 球体
- `Cylinder(radius, height, centered)` - 圆柱体
- `Cone(radius1, radius2, height)` - 圆锥体
- `Polygon(points)` - 多边形

### 变换操作
- `Translate([x, y, z], shape)` - 平移
- `Rotate([x, y, z], angle, shape)` - 旋转
- `Scale([x, y, z], shape)` - 缩放
- `Mirror([x, y, z], shape)` - 镜像

### 布尔运算
- `Union(shapes)` - 并集
- `Difference(shape1, shapes2)` - 差集
- `Intersection(shapes)` - 交集

### 高级操作
- `Extrude(profile, height)` - 拉伸
- `Revolve(profile, angle)` - 旋转拉伸
- `Loft(profiles)` - 放样
- `FilletEdges(shape, radius, edges)` - 圆角
- `ChamferEdges(shape, distance, edges)` - 倒角

### UI 控件
- `Slider(name, default, min, max)` - 滑块
- `Checkbox(name, default)` - 复选框
- `TextInput(name, default)` - 文本输入
- `Dropdown(name, options, default)` - 下拉框

## 🎨 UI 特性

### 工程软件配色
- 深蓝灰色主题（类似 AutoCAD）
- 专业的渐变和阴影效果
- 清晰的视觉层次

### 响应式设计
- **桌面端** - 完整功能，宽敞布局
- **平板端** - 优化的菜单和控件
- **手机端** - 折叠菜单，垂直布局

### 动画效果
- 平滑的过渡动画
- 悬停效果
- 模态框淡入淡出

## 🔧 技术栈

- **前端框架**: Vanilla JavaScript
- **3D 引擎**: Three.js
- **CAD 内核**: OpenCascade.js
- **代码编辑器**: Monaco Editor
- **布局系统**: Golden Layout
- **UI 控件**: Tweakpane
- **后端服务**: Supabase (认证 + 数据库)
- **AI 服务**: DeepSeek API

## 📝 积分计费说明

- 新用户注册赠送 **100 积分**
- AI 生成按 token 消耗计费
- 默认费率：**0.01 积分/token**
- 可在 `js/config.js` 中调整费率

示例消耗：
- 简单模型（~500 tokens）≈ 5 积分
- 中等复杂度（~1000 tokens）≈ 10 积分
- 复杂模型（~2000 tokens）≈ 20 积分

## 🔒 安全注意事项

1. **不要提交配置文件** - `js/config.js` 包含敏感信息，应添加到 `.gitignore`
2. **使用环境变量** - 生产环境建议使用环境变量管理密钥
3. **启用 RLS** - Supabase 行级安全策略已配置，确保数据安全
4. **API 密钥保护** - DeepSeek API 密钥应妥善保管

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题或建议，请通过 GitHub Issues 联系。

---

**享受 AI 驱动的 3D 建模体验！** 🚀
