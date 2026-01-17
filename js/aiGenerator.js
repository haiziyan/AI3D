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
                            content: `你是一个专业的 CAD 建模助手，精通 AI 3D Studio（基于 OpenCascade.js）。用户会用自然语言描述 3D 模型，你需要生成可执行的 JavaScript 代码。

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
- Difference(baseShape, toolShape) 或 Difference(base, [tools]) - 差集（从 base 中减去 tool）
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

## 重要规则

1. **坐标系统**: Z 轴向上，右手坐标系
2. **单位**: 默认单位是毫米
3. **形状组合**: 使用 sceneShapes.push() 或直接返回形状
4. **变量命名**: 使用有意义的英文变量名
5. **注释**: 添加简洁的中文注释说明关键步骤

## 代码模板

\`\`\`javascript
// 1. 定义参数（可选，用于参数化设计）
let radius = Slider("半径", 30, 10, 50);

// 2. 创建基础形状
let base = Box(100, 100, 20);

// 3. 创建辅助形状
let hole = Cylinder(radius, 30, true);

// 4. 布尔运算
let result = Difference(base, [hole]);

// 5. 变换和定位
let final = Translate([0, 0, 10], result);

\`\`\`

## 最佳实践

1. **简洁优先**: 生成简洁、可读的代码
2. **参数化**: 复杂模型使用 Slider 等控件
3. **分步构建**: 复杂形状分步骤创建
4. **合理命名**: 变量名反映其用途
5. **添加注释**: 关键步骤添加注释
6. **错误处理**: 确保参数合理（如半径 > 0）

## 输出要求

- 只返回纯 JavaScript 代码
- 不要包含 \`\`\`javascript 或其他 markdown 标记
- 不要添加额外的解释文字
- 代码必须可以直接在 AI 3D Studio 中执行
- 确保所有形状都通过 sceneShapes.push() 添加到场景

现在，请根据用户的描述生成相应的 AI 3D Studio 代码。`
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

            // 记录生成历史到数据库
            await this.logGeneration(prompt, creditsUsed, totalTokens);

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

    async logGeneration(description, creditsConsumed, tokensUsed) {
        if (!authManager.supabase || !authManager.currentUser) return;

        try {
            const { error } = await authManager.supabase
                .from('ai_generations')
                .insert([
                    {
                        user_id: authManager.currentUser.id,
                        description: description,
                        credits_consumed: creditsConsumed,
                        tokens_used: tokensUsed
                    }
                ]);

            if (error) {
                console.error('记录生成历史失败:', error);
            }
        } catch (err) {
            console.error('记录生成历史异常:', err);
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
    
    // 添加生成方法到全局对象，供左侧栏AI模块调用
    window.aiGenerator = {
        generateFromPrompt: async function(prompt) {
            if (!prompt) {
                alert('请输入描述');
                return;
            }

            if (!authManager.currentUser) {
                alert('请先登录');
                authManager.showLoginModal();
                return;
            }

            const aiButton = document.getElementById('aiGenerateBtnModule');
            if (aiButton) {
                aiButton.disabled = true;
                aiButton.classList.add('generating');
                aiButton.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    生成中...
                `;
            }

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
                if (aiButton) {
                    aiButton.disabled = false;
                    aiButton.classList.remove('generating');
                    aiButton.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        生成代码
                    `;
                }
            }
        }
    };
}

// AI 输入框处理（已废弃，保留以防兼容性问题）
function initAIInput() {
    // 顶部AI输入已移除，此函数保留为空
}
