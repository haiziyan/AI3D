// AI 代码生成器
class AIGenerator {
    constructor() {
        this.apiKey = CONFIG.DEEPSEEK_API_KEY;
        this.apiUrl = CONFIG.DEEPSEEK_API_URL;
    }

    async generateCode(prompt) {
        if (!authManager.currentUser) {
            throw new Error('请先登录');
        }

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: `你是一个专业的 CAD 建模助手。用户会用自然语言描述他们想要创建的 3D 模型，你需要生成对应的 Cascade Studio 代码。

Cascade Studio 是基于 OpenCascade.js 的 CAD 建模工具，支持以下函数：

基础形状：
- Box(width, height, depth, centered) - 创建长方体
- Sphere(radius) - 创建球体
- Cylinder(radius, height, centered) - 创建圆柱体
- Cone(radius1, radius2, height) - 创建圆锥体
- Polygon(points) - 创建多边形

变换操作：
- Translate([x, y, z], shape) - 平移
- Rotate([x, y, z], angle, shape) - 旋转
- Scale([x, y, z], shape) - 缩放
- Mirror([x, y, z], shape) - 镜像

布尔运算：
- Union(shapes) - 并集
- Difference(shape1, shapes2) - 差集
- Intersection(shapes) - 交集

高级操作：
- Extrude(profile, height) - 拉伸
- Revolve(profile, angle) - 旋转拉伸
- Loft(profiles) - 放样
- FilletEdges(shape, radius, edges) - 圆角
- ChamferEdges(shape, distance, edges) - 倒角

UI 控件：
- Slider(name, default, min, max) - 滑块
- Checkbox(name, default) - 复选框
- TextInput(name, default) - 文本输入
- Dropdown(name, options, default) - 下拉框

请只返回可执行的 JavaScript 代码，不要包含任何解释或 markdown 标记。代码应该直接可以在 Cascade Studio 中运行。`
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });

            if (!response.ok) {
                throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            // 计算消耗的 token 和积分
            const totalTokens = data.usage.total_tokens;
            const creditsUsed = totalTokens * CONFIG.CREDITS_PER_TOKEN;

            // 扣除积分
            await authManager.deductCredits(creditsUsed);

            console.log(`AI 生成完成，消耗 ${totalTokens} tokens，扣除 ${creditsUsed.toFixed(2)} 积分`);

            // 提取生成的代码
            let generatedCode = data.choices[0].message.content;
            
            // 清理代码（移除可能的 markdown 标记）
            generatedCode = generatedCode.replace(/```javascript\n?/g, '').replace(/```\n?/g, '').trim();

            return {
                code: generatedCode,
                tokensUsed: totalTokens,
                creditsUsed: creditsUsed
            };

        } catch (error) {
            console.error('AI 生成失败:', error);
            throw error;
        }
    }

    async generateCodeWithRetry(prompt, maxRetries = 2) {
        let lastError;
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await this.generateCode(prompt);
            } catch (error) {
                lastError = error;
                console.log(`生成失败，重试 ${i + 1}/${maxRetries}...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        throw lastError;
    }
}

// 创建全局实例
let aiGenerator;
if (typeof window !== 'undefined') {
    aiGenerator = new AIGenerator();
}

// AI 输入框处理
function initAIInput() {
    const aiInput = document.getElementById('aiPromptInput');
    const aiButton = document.getElementById('aiGenerateBtn');
    
    if (aiButton) {
        aiButton.onclick = async () => {
            const prompt = aiInput.value.trim();
            if (!prompt) {
                alert('请输入描述');
                return;
            }

            if (!authManager.currentUser) {
                alert('请先登录');
                authManager.showLoginModal();
                return;
            }

            aiButton.disabled = true;
            aiButton.textContent = '生成中...';

            try {
                const result = await aiGenerator.generateCodeWithRetry(prompt);
                
                // 将生成的代码插入到编辑器
                if (monacoEditor) {
                    monacoEditor.setValue(result.code);
                    console.log(`代码已生成！消耗 ${result.tokensUsed} tokens，${result.creditsUsed.toFixed(2)} 积分`);
                    
                    // 自动评估代码
                    setTimeout(() => {
                        monacoEditor.evaluateCode(true);
                    }, 500);
                }
            } catch (error) {
                alert('生成失败: ' + error.message);
            } finally {
                aiButton.disabled = false;
                aiButton.textContent = '生成';
            }
        };
    }

    // 支持回车键生成
    if (aiInput) {
        aiInput.onkeypress = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                aiButton.click();
            }
        };
    }
}
