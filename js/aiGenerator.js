// AI 代码生成器 - 支持多轮对话的Agent模式
class AIGenerator {
    constructor() {
        this.apiKey = CONFIG.DEEPSEEK_API_KEY;
        this.apiUrl = CONFIG.DEEPSEEK_API_URL;
        
        // 当前对话会话
        this.currentConversationId = null;
        this.conversationHistory = []; // 对话历史 [{role: 'user'/'assistant', content: '...', code: '...'}]
        
        // 系统提示词
        this.systemPrompt = `你是一个专业的 CAD 建模助手，精通 AI 3D Studio（基于 OpenCascade.js）。你支持多轮对话，可以根据用户的反馈逐步修改和完善 3D 模型。

## 核心 API 参考

### 1. 基础形状创建
- Box(width, height, depth, centered=false) - 长方体，centered=true 时中心在原点
- Sphere(radius) - 球体，中心在原点
- Cylinder(radius, height, centered=false) - 圆柱体，centered=true 时中心在原点
- Cone(radius1, radius2, height) - 圆锥/圆台，radius1 是底部，radius2 是顶部
- Text3D(text, size, height, font='Arial') - 3D 文字

### 2. 2D 形状（用于拉伸、旋转等）
- Circle(radius) - 圆形线框
- Rectangle(width, height, centered=false) - 矩形线框
- Polygon(points) - 多边形，points 是 [x,y] 坐标数组
- RoundedRectangle(width, height, radius) - 圆角矩形

### 3. 变换操作（返回新形状）
- Translate([x, y, z], shape) - 平移
- Rotate([axisX, axisY, axisZ], angleDegrees, shape) - 绕指定轴旋转
- Scale([scaleX, scaleY, scaleZ], shape) - 缩放
- Mirror([planeX, planeY, planeZ], shape, origin=[0,0,0]) - 镜像

### 4. 布尔运算
- Union(shape1, shape2) 或 Union([shapes]) - 并集
- Difference(base, [tools]) - 差集（从 base 中减去 tool）
- Intersection(shape1, shape2) 或 Intersection([shapes]) - 交集

### 5. 高级建模操作
- Extrude(wire, height) - 拉伸 2D 轮廓
- Revolve(wire, angle=360, axis=[0,0,1]) - 旋转拉伸
- Loft([wire1, wire2, ...], ruled=false) - 放样连接多个截面
- Pipe(wire, path) - 沿路径扫掠
- Offset(wire, distance, openEnds=false) - 偏移 2D 轮廓

### 6. 边缘处理
- FilletEdges(shape, radius, edgeList=[]) - 圆角，edgeList 为空时处理所有边
- ChamferEdges(shape, distance, edgeList=[]) - 倒角

### 7. UI 控件（用于参数化设计）
- Slider(name, defaultValue, minValue, maxValue) - 返回滑块当前值
- Checkbox(name, defaultValue) - 返回布尔值
- TextInput(name, defaultValue) - 返回字符串
- Dropdown(name, options, defaultValue) - options 是对象 {label: value}

### 8. 数组和模式
- ForEach(array, callback) - 遍历数组
- LinearArray(shape, direction, count, spacing) - 线性阵列
- CircularArray(shape, axis, count, angle=360) - 环形阵列

## 多轮对话模式

当用户提出修改请求时（如"把它变大一点"、"改成红色"、"添加一个孔"等），你需要：
1. 理解用户的修改意图
2. 基于之前生成的代码进行修改
3. 保持代码的连贯性和可读性
4. 只修改需要改变的部分

## 重要规则

1. **坐标系统**: Z 轴向上，右手坐标系
2. **单位**: 默认单位是毫米
3. **形状组合**: 使用 sceneShapes.push() 或直接返回形状
4. **变量命名**: 使用有意义的英文变量名
5. **注释**: 添加简洁的中文注释说明关键步骤
6. **增量修改**: 在多轮对话中，基于之前的代码进行修改，而不是重新生成

## 输出要求

- 只返回纯 JavaScript 代码
- 不要包含 \`\`\`javascript 或其他 markdown 标记
- 不要添加额外的解释文字
- 代码必须可以直接在 AI 3D Studio 中执行

现在，请根据用户的描述和对话历史生成相应的 AI 3D Studio 代码。`;
    }

    // 创建新的对话会话
    async createNewConversation(title = null) {
        if (!authManager.currentUser || !authManager.supabase) {
            throw new Error('请先登录');
        }

        try {
            // 如果没有提供标题，使用默认标题
            if (!title) {
                const now = new Date();
                title = `对话 ${now.toLocaleString('zh-CN')}`;
            }

            const { data, error } = await authManager.supabase
                .from('ai_conversations')
                .insert([{
                    user_id: authManager.currentUser.id,
                    title: title
                }])
                .select()
                .single();

            if (error) throw error;

            this.currentConversationId = data.id;
            this.conversationHistory = [];
            
            console.log('创建新对话会话:', data.id);
            return data;
        } catch (error) {
            console.error('创建对话会话失败:', error);
            throw error;
        }
    }

    // 加载现有对话会话
    async loadConversation(conversationId) {
        if (!authManager.currentUser || !authManager.supabase) {
            throw new Error('请先登录');
        }

        try {
            // 加载对话历史
            const { data, error } = await authManager.supabase
                .from('ai_generations')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            this.currentConversationId = conversationId;
            this.conversationHistory = data.map(record => ({
                role: record.role,
                content: record.description,
                code: record.generated_code,
                tokensUsed: record.tokens_used,
                creditsConsumed: record.credits_consumed
            }));

            console.log('加载对话会话:', conversationId, '历史记录数:', this.conversationHistory.length);
            return this.conversationHistory;
        } catch (error) {
            console.error('加载对话会话失败:', error);
            throw error;
        }
    }

    // 清空当前对话
    clearConversation() {
        this.currentConversationId = null;
        this.conversationHistory = [];
        console.log('已清空对话历史');
    }

    // 生成代码（支持多轮对话）
    async generateCode(prompt, currentCode = null) {
        if (!authManager.currentUser) {
            throw new Error('请先登录');
        }

        try {
            // 如果没有当前对话会话，创建一个新的
            if (!this.currentConversationId) {
                // 使用用户输入的前20个字符作为标题
                const title = prompt.length > 20 ? prompt.substring(0, 20) + '...' : prompt;
                await this.createNewConversation(title);
            }

            // 构建消息历史
            const messages = [
                {
                    role: 'system',
                    content: this.systemPrompt
                }
            ];

            // 添加对话历史
            for (const msg of this.conversationHistory) {
                messages.push({
                    role: 'user',
                    content: msg.content
                });
                if (msg.code) {
                    messages.push({
                        role: 'assistant',
                        content: msg.code
                    });
                }
            }

            // 如果有当前代码，添加上下文
            if (currentCode && this.conversationHistory.length > 0) {
                messages.push({
                    role: 'user',
                    content: `当前代码：\n\`\`\`javascript\n${currentCode}\n\`\`\`\n\n用户新的需求：${prompt}`
                });
            } else {
                messages.push({
                    role: 'user',
                    content: prompt
                });
            }

            // 调用 DeepSeek API
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: messages,
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

            // 提取生成的代码
            let generatedCode = data.choices[0].message.content;
            
            // 清理代码（移除可能的 markdown 标记）
            generatedCode = generatedCode.replace(/```javascript\n?/g, '').replace(/```\n?/g, '').trim();

            // 扣除积分
            await authManager.deductCredits(creditsUsed);

            // 记录到对话历史（内存）
            this.conversationHistory.push({
                role: 'user',
                content: prompt,
                code: null
            });
            this.conversationHistory.push({
                role: 'assistant',
                content: generatedCode,
                code: generatedCode,
                tokensUsed: totalTokens,
                creditsConsumed: creditsUsed
            });

            // 记录到数据库
            await this.logGenerationToConversation(prompt, generatedCode, creditsUsed, totalTokens);

            return {
                code: generatedCode,
                tokensUsed: totalTokens,
                creditsUsed: creditsUsed,
                conversationId: this.currentConversationId
            };

        } catch (error) {
            console.error('AI 生成失败:', error);
            throw error;
        }
    }

    // 记录生成到对话会话
    async logGenerationToConversation(userPrompt, generatedCode, creditsConsumed, tokensUsed) {
        if (!authManager.supabase || !authManager.currentUser || !this.currentConversationId) return;

        try {
            // 记录用户消息
            await authManager.supabase
                .from('ai_generations')
                .insert([{
                    user_id: authManager.currentUser.id,
                    conversation_id: this.currentConversationId,
                    description: userPrompt,
                    generated_code: null,
                    credits_consumed: 0,
                    tokens_used: 0,
                    role: 'user'
                }]);

            // 记录AI响应
            await authManager.supabase
                .from('ai_generations')
                .insert([{
                    user_id: authManager.currentUser.id,
                    conversation_id: this.currentConversationId,
                    description: '生成的代码',
                    generated_code: generatedCode,
                    credits_consumed: creditsConsumed,
                    tokens_used: tokensUsed,
                    role: 'assistant'
                }]);

            // 更新对话会话的更新时间
            await authManager.supabase
                .from('ai_conversations')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', this.currentConversationId);

            // 刷新历史记录显示
            if (window.refreshConversationList) {
                window.refreshConversationList();
            }
        } catch (err) {
            console.error('记录生成历史异常:', err);
        }
    }

    // 获取对话列表
    async getConversationList(limit = 10) {
        if (!authManager.currentUser || !authManager.supabase) {
            throw new Error('请先登录');
        }

        try {
            const { data, error } = await authManager.supabase
                .from('ai_conversations')
                .select('*')
                .eq('user_id', authManager.currentUser.id)
                .order('updated_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('获取对话列表失败:', error);
            throw error;
        }
    }

    // 删除对话会话
    async deleteConversation(conversationId) {
        if (!authManager.currentUser || !authManager.supabase) {
            throw new Error('请先登录');
        }

        try {
            const { error } = await authManager.supabase
                .from('ai_conversations')
                .delete()
                .eq('id', conversationId)
                .eq('user_id', authManager.currentUser.id);

            if (error) throw error;

            // 如果删除的是当前对话，清空当前对话
            if (this.currentConversationId === conversationId) {
                this.clearConversation();
            }

            console.log('删除对话会话:', conversationId);
        } catch (error) {
            console.error('删除对话会话失败:', error);
            throw error;
        }
    }

    // 带重试的生成方法
    async generateCodeWithRetry(prompt, currentCode = null, maxRetries = 2) {
        let lastError;
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await this.generateCode(prompt, currentCode);
            } catch (error) {
                lastError = error;
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
    
    // 添加生成方法到全局对象，供左侧栏AI模块调用
    window.aiGenerator = {
        generateFromPrompt: async function(prompt) {
            if (!prompt) {
                alert('请输入描述');
                return;
            }

            if (!authManager.currentUser) {
                alert('请先登录');
                authManager.showAuthModal();
                return;
            }

            const aiButton = document.getElementById('aiGenerateBtnModule');
            if (aiButton) {
                aiButton.disabled = true;
                aiButton.classList.add('generating');
                aiButton.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                    </svg>
                `;
            }

            try {
                // 获取当前编辑器中的代码（用于多轮对话上下文）
                const currentCode = monacoEditor ? monacoEditor.getValue() : null;
                
                const result = await aiGenerator.generateCodeWithRetry(prompt, currentCode);
                
                // 将生成的代码插入到编辑器
                if (monacoEditor) {
                    monacoEditor.setValue(result.code);
                    
                    // 自动评估代码
                    setTimeout(() => {
                        monacoEditor.evaluateCode(true);
                    }, 500);
                }

                // 清空输入框
                const promptInput = document.getElementById('aiPromptInputModule');
                if (promptInput) {
                    promptInput.value = '';
                }

                // 显示成功提示
                console.log(`生成成功！消耗 ${result.tokensUsed} tokens，${result.creditsUsed.toFixed(2)} 积分`);
                
            } catch (error) {
                alert('生成失败: ' + error.message);
            } finally {
                if (aiButton) {
                    aiButton.disabled = false;
                    aiButton.classList.remove('generating');
                    aiButton.innerHTML = `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M22 2L11 13"/>
                            <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
                        </svg>
                    `;
                }
            }
        },
        
        // 清空当前对话
        clearCurrentConversation: function() {
            if (confirm('确定要开始新对话吗？当前对话历史将被清空。')) {
                aiGenerator.clearConversation();
                alert('已开始新对话');
                
                // 刷新对话列表
                if (window.refreshConversationList) {
                    window.refreshConversationList();
                }
            }
        },
        
        // 加载对话
        loadConversation: async function(conversationId) {
            try {
                await aiGenerator.loadConversation(conversationId);
                alert('对话已加载');
            } catch (error) {
                alert('加载对话失败: ' + error.message);
            }
        }
    };
}

// AI 输入框处理（已废弃，保留以防兼容性问题）
function initAIInput() {
    // 顶部AI输入已移除，此函数保留为空
}
