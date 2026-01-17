# 配置说明

## 重要：首次使用必读

在使用本应用之前，你需要配置以下服务：

## 1. Supabase 配置

### 步骤 1：创建 Supabase 项目

1. 访问 https://supabase.com/
2. 注册并登录
3. 点击 "New Project" 创建新项目
4. 记录下项目的 URL 和 anon key

### 步骤 2：创建数据库表

在 Supabase 控制台的 SQL Editor 中执行以下 SQL：

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

-- 启用行级安全策略
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- 安全策略
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON user_credits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits" ON user_credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 触发器
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

## 2. DeepSeek API 配置

1. 访问 https://platform.deepseek.com/
2. 注册并登录
3. 在 API Keys 页面创建新的 API Key
4. 记录下 API Key

## 3. 更新配置文件

编辑 `js/config.js` 文件，替换以下内容：

```javascript
const CONFIG = {
    // 替换为你的 Supabase URL
    SUPABASE_URL: 'https://your-project.supabase.co',
    
    // 替换为你的 Supabase Anon Key
    SUPABASE_ANON_KEY: 'your-anon-key-here',
    
    // 替换为你的 DeepSeek API Key
    DEEPSEEK_API_KEY: 'your-deepseek-api-key-here',
    
    // DeepSeek API URL（通常不需要修改）
    DEEPSEEK_API_URL: 'https://api.deepseek.com/v1/chat/completions',
    
    // 初始积分（可自定义）
    INITIAL_CREDITS: 100,
    
    // 每个 token 消耗的积分（可自定义）
    CREDITS_PER_TOKEN: 0.01
};
```

## 4. 启动应用

配置完成后，使用以下命令启动应用：

```bash
# 方式 1：使用 npx
npx http-server -p 8080

# 方式 2：使用 Python
python -m http.server 8080

# 方式 3：使用 Node.js serve
npx serve
```

然后在浏览器中访问 `http://localhost:8080`

## 常见问题

### Q: 为什么需要配置这些服务？

A: 
- **Supabase** 提供用户认证和数据库服务，用于管理用户账户和积分系统
- **DeepSeek API** 提供 AI 代码生成能力，将自然语言转换为 3D 建模代码

### Q: 这些服务收费吗？

A:
- **Supabase** 提供免费套餐，足够个人使用
- **DeepSeek API** 按使用量计费，价格相对较低

### Q: 可以不配置这些服务吗？

A: 不配置的话，AI 生成功能和用户系统将无法使用，但基本的 CAD 建模功能仍然可用。

### Q: 配置文件安全吗？

A: 请不要将包含真实密钥的 `config.js` 提交到公共代码仓库。建议添加到 `.gitignore`。

## 需要帮助？

如果在配置过程中遇到问题，请查看：
- Supabase 文档: https://supabase.com/docs
- DeepSeek 文档: https://platform.deepseek.com/docs

或在 GitHub Issues 中提问。
