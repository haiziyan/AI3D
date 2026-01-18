// 用户认证和积分管理
class AuthManager {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.userCredits = 0;
        this.init();
    }

    async init() {
        // 初始化 Supabase 客户端
        if (typeof supabase !== 'undefined' && CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY) {
            this.supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
            
            // 检查当前用户
            const { data: { user } } = await this.supabase.auth.getUser();
            if (user) {
                this.currentUser = user;
                await this.loadUserCredits();
            } else {
                // 如果没有用户登录，显示登录/注册按钮
                this.updateUI();
            }

            // 监听认证状态变化
            this.supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN') {
                    this.currentUser = session.user;
                    this.loadUserCredits();
                    this.updateUI();
                    // 登录后自动刷新生成历史记录
                    if (window.refreshGenerationHistory) {
                        setTimeout(() => {
                            window.refreshGenerationHistory();
                        }, 500);
                    }
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                    this.userCredits = 0;
                    this.updateUI();
                    // 登出后也刷新生成历史记录（显示登录提示）
                    if (window.refreshGenerationHistory) {
                        setTimeout(() => {
                            window.refreshGenerationHistory();
                        }, 500);
                    }
                }
            });
        } else {
            // 如果 Supabase 未配置，也显示登录/注册按钮
            this.updateUI();
        }
    }

    async loadUserCredits() {
        if (!this.supabase || !this.currentUser) return;

        try {
            const { data, error } = await this.supabase
                .from('user_credits')
                .select('credits')
                .eq('user_id', this.currentUser.id)
                .single();

            if (error) {
                // 如果用户记录不存在，创建新记录
                if (error.code === 'PGRST116') {
                    await this.createUserCredits();
                } else {
                    console.error('加载积分失败:', error);
                }
            } else {
                this.userCredits = data.credits;
                this.updateUI();
            }
        } catch (err) {
            console.error('加载积分异常:', err);
        }
    }

    async createUserCredits() {
        if (!this.supabase || !this.currentUser) return;

        try {
            const { data, error } = await this.supabase
                .from('user_credits')
                .insert([
                    { user_id: this.currentUser.id, credits: CONFIG.INITIAL_CREDITS }
                ])
                .select()
                .single();

            if (error) {
                console.error('创建积分记录失败:', error);
            } else {
                this.userCredits = CONFIG.INITIAL_CREDITS;
                this.updateUI();
            }
        } catch (err) {
            console.error('创建积分记录异常:', err);
        }
    }

    async deductCredits(amount) {
        if (!this.supabase || !this.currentUser) {
            throw new Error('用户未登录');
        }

        if (this.userCredits < amount) {
            throw new Error('积分不足，请充值');
        }

        try {
            const newCredits = this.userCredits - amount;
            const { error } = await this.supabase
                .from('user_credits')
                .update({ credits: newCredits })
                .eq('user_id', this.currentUser.id);

            if (error) {
                throw new Error('扣除积分失败: ' + error.message);
            }

            this.userCredits = newCredits;
            this.updateUI();

            // 记录消费历史
            await this.logTransaction(amount, 'AI生成消费');
        } catch (err) {
            console.error('扣除积分异常:', err);
            throw err;
        }
    }

    async logTransaction(amount, description) {
        if (!this.supabase || !this.currentUser) return;

        try {
            await this.supabase
                .from('credit_transactions')
                .insert([
                    {
                        user_id: this.currentUser.id,
                        amount: -amount,
                        description: description,
                        balance_after: this.userCredits
                    }
                ]);
        } catch (err) {
            console.error('记录交易失败:', err);
        }
    }

    async signIn(email, password) {
        if (!this.supabase) {
            throw new Error('Supabase 未初始化');
        }

        const { data, error } = await this.supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            throw error;
        }

        return data;
    }

    async signUp(email, password) {
        if (!this.supabase) {
            throw new Error('Supabase 未初始化');
        }

        const { data, error } = await this.supabase.auth.signUp({
            email: email,
            password: password
        });

        if (error) {
            throw error;
        }

        return data;
    }

    async signOut() {
        if (!this.supabase) return;

        const { error } = await this.supabase.auth.signOut();
        if (error) {
            console.error('登出失败:', error);
        }
    }

    updateUI() {
        const userInfoElement = document.getElementById('userInfo');
        const mobileUserInfoElement = document.getElementById('mobileUserInfo');
        
        let userHTML = '';
        if (this.currentUser) {
            userHTML = `
                <span class="user-credits">${this.userCredits.toFixed(2)} 积分</span>
                <button onclick="authManager.showUserCenter()" class="btn-user-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span class="btn-text">用户中心</span>
                </button>
            `;
        } else {
            userHTML = `
                <button onclick="authManager.showAuthModal()" class="btn-auth">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span class="btn-text">登录/注册</span>
                </button>
            `;
        }
        
        // 桌面端用户信息
        if (userInfoElement) {
            userInfoElement.innerHTML = userHTML;
        }
        
        // 移动端用户信息（在菜单内）
        if (mobileUserInfoElement) {
            if (this.currentUser) {
                mobileUserInfoElement.innerHTML = `
                    <div class="mobile-user-card">
                        <div class="mobile-user-avatar">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                        </div>
                        <div class="mobile-user-info">
                            <div class="mobile-user-email">${this.currentUser.email}</div>
                            <div class="mobile-user-credits">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M12 6v6l4 2"/>
                                </svg>
                                ${this.userCredits.toFixed(2)} 积分
                            </div>
                        </div>
                    </div>
                    <div class="mobile-user-actions">
                        <a href="#" onclick="authManager.showUserCenter(); toggleMenu(); return false;" class="mobile-action-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            用户中心
                        </a>
                        <a href="#" onclick="authManager.signOut(); toggleMenu(); return false;" class="mobile-action-btn logout">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                            退出登录
                        </a>
                    </div>
                `;
            } else {
                mobileUserInfoElement.innerHTML = `
                    <div class="mobile-login-prompt">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <p>登录后可使用完整功能</p>
                        <a href="#" onclick="authManager.showAuthModal(); toggleMenu(); return false;" class="mobile-login-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                <polyline points="10 17 15 12 10 7"/>
                                <line x1="15" y1="12" x2="3" y2="12"/>
                            </svg>
                            立即登录/注册
                        </a>
                    </div>
                `;
            }
        }
        
        // 更新用户中心内的信息
        this.updateUserCenterInfo();
    }
    
    updateUserCenterInfo() {
        if (!this.currentUser) return;
        
        const userEmailElement = document.getElementById('userCenterEmail');
        const creditsAmountElement = document.getElementById('creditsAmount');
        
        if (userEmailElement) {
            userEmailElement.textContent = this.currentUser.email;
        }
        
        if (creditsAmountElement) {
            creditsAmountElement.textContent = this.userCredits.toFixed(2);
        }
    }

    showAuthModal(tab = 'login') {
        const modal = document.getElementById('authModal');
        
        // 设置表单提交事件
        const loginForm = document.getElementById('loginFormElement');
        const signupForm = document.getElementById('signupFormElement');
        
        // 登录表单
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            try {
                await this.signIn(email, password);
                modal.style.display = 'none';
                console.log('登录成功');
            } catch (error) {
                alert('登录失败: ' + error.message);
            }
        };
        
        // 注册表单
        signupForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
            
            if (password !== passwordConfirm) {
                alert('两次输入的密码不一致');
                return;
            }
            
            try {
                await this.signUp(email, password);
                modal.style.display = 'none';
                alert('注册成功！请查收邮件验证账户。');
            } catch (error) {
                alert('注册失败: ' + error.message);
            }
        };
        
        // 切换到指定的tab
        document.querySelectorAll('.auth-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.auth-form-content').forEach(content => {
            content.classList.remove('active');
        });
        
        if (tab === 'signup') {
            document.querySelectorAll('.auth-tab-btn')[1].classList.add('active');
            document.getElementById('signupForm').classList.add('active');
        } else {
            document.querySelectorAll('.auth-tab-btn')[0].classList.add('active');
            document.getElementById('loginForm').classList.add('active');
        }
        
        modal.style.display = 'flex';
    }

    showUserCenter() {
        const modal = document.getElementById('userCenterModal');
        this.updateUserCenterInfo();
        this.loadTransactionHistory();
        
        // 显示注册时间
        if (this.currentUser && this.currentUser.created_at) {
            const createdAtElement = document.getElementById('userCreatedAt');
            if (createdAtElement) {
                const date = new Date(this.currentUser.created_at);
                createdAtElement.textContent = date.toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
        }
        
        modal.style.display = 'flex';
    }

    async loadTransactionHistory() {
        if (!this.supabase || !this.currentUser) return;

        try {
            // 从 ai_generations 表加载生成记录
            const { data, error } = await this.supabase
                .from('ai_generations')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) {
                console.error('加载生成记录失败:', error);
                return;
            }

            const historyList = document.getElementById('transactionHistory');
            if (historyList) {
                if (!data || data.length === 0) {
                    historyList.innerHTML = `
                        <div class="empty-state">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                            </svg>
                            <p>暂无生成记录</p>
                            <span>开始使用AI生成功能后，生成记录将显示在这里</span>
                        </div>
                    `;
                } else {
                    historyList.innerHTML = data.map(record => {
                        const hasCode = record.generated_code && record.generated_code.trim().length > 0;
                        const codePreview = hasCode ? record.generated_code.substring(0, 100) + (record.generated_code.length > 100 ? '...' : '') : '';
                        
                        return `
                        <div class="generation-item" data-record-id="${record.id}">
                            <div class="gen-header">
                                <span class="gen-date">${new Date(record.created_at).toLocaleString('zh-CN', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</span>
                                <span class="gen-credits">-${record.credits_consumed.toFixed(2)} 积分</span>
                            </div>
                            <div class="gen-description">${this.escapeHtml(record.description || 'AI生成任务')}</div>
                            ${hasCode ? `
                            <div class="gen-code-preview">
                                <code>${this.escapeHtml(codePreview)}</code>
                            </div>
                            ` : ''}
                            <div class="gen-footer">
                                <span class="gen-tokens">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <path d="M12 6v6l4 2"/>
                                    </svg>
                                    ${record.tokens_used || 0} tokens
                                </span>
                                ${hasCode ? `
                                <button class="btn-load-code" onclick="authManager.loadGeneratedCode('${record.id}')">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4"/>
                                        <polyline points="17 8 12 3 7 8"/>
                                        <line x1="12" y1="3" x2="12" y2="15"/>
                                    </svg>
                                    加载代码
                                </button>
                                ` : ''}
                            </div>
                        </div>
                    `}).join('');
                }
            }
        } catch (err) {
            console.error('加载生成记录异常:', err);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async loadGeneratedCode(recordId) {
        if (!this.supabase || !this.currentUser) return;

        try {
            const { data, error } = await this.supabase
                .from('ai_generations')
                .select('generated_code, description')
                .eq('id', recordId)
                .eq('user_id', this.currentUser.id)
                .single();

            if (error) {
                console.error('加载代码失败:', error);
                alert('加载代码失败: ' + error.message);
                return;
            }

            if (data && data.generated_code) {
                // 将代码加载到编辑器
                if (window.monacoEditor) {
                    window.monacoEditor.setValue(data.generated_code);
                    console.log('代码已加载到编辑器');
                    
                    // 关闭用户中心模态框
                    document.getElementById('userCenterModal').style.display = 'none';
                    
                    // 自动评估代码
                    setTimeout(() => {
                        window.monacoEditor.evaluateCode(true);
                    }, 500);
                } else {
                    alert('编辑器未初始化');
                }
            } else {
                alert('未找到生成的代码');
            }
        } catch (err) {
            console.error('加载代码异常:', err);
            alert('加载代码失败: ' + err.message);
        }
    }
}

// 创建全局实例
let authManager;
if (typeof window !== 'undefined') {
    authManager = new AuthManager();
}
