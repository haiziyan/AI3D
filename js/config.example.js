// 配置文件模板
// 复制此文件为 config.js 并填入你的实际配置

const CONFIG = {
    // Supabase 配置
    // 1. 访问 https://supabase.com/ 创建项目
    // 2. 在项目设置中找到 URL 和 anon key
    SUPABASE_URL: 'YOUR_SUPABASE_URL', // 例如: https://xxxxx.supabase.co
    SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY', // 以 eyJ 开头的长字符串
    
    // DeepSeek API 配置
    // 1. 访问 https://platform.deepseek.com/ 注册
    // 2. 在 API Keys 页面创建新密钥
    DEEPSEEK_API_KEY: 'YOUR_DEEPSEEK_API_KEY', // 以 sk- 开头
    DEEPSEEK_API_URL: 'https://api.deepseek.com/v1/chat/completions',
    
    // 积分配置
    INITIAL_CREDITS: 100, // 新用户初始积分
    CREDITS_PER_TOKEN: 0.01 // 每个 token 消耗的积分
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
