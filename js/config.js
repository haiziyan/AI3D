// 配置文件
const CONFIG = {
    // Supabase 配置
    SUPABASE_URL: 'https://jxjlcfbezypkbrpvyujm.supabase.co', // 请替换为你的 Supabase URL
    SUPABASE_ANON_KEY: 'sb_publishable_7vsMbN81aJpXj_L7xB4coQ_uvELs7OV', // 请替换为你的 Supabase Anon Key
    
    // DeepSeek API 配置
    DEEPSEEK_API_KEY: 'sk-e63821f379cf470198f033aed050e598', // 请替换为你的 DeepSeek API Key
    DEEPSEEK_API_URL: 'https://api.deepseek.com/v1/chat/completions',
    
    // 积分配置
    INITIAL_CREDITS: 100, // 初始积分
    CREDITS_PER_TOKEN: 0.01 // 每个 token 消耗的积分
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
