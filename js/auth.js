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
            }

            // 监听认证状态变化
            this.supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN') {
                    this.currentUser = session.user;
                    this.loadUserCredits();
                    this.updateUI();
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                    this.userCredits = 0;
                    this.updateUI();
                }
            });
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
        if (userInfoElement) {
            if (this.currentUser) {
                userInfoElement.innerHTML = `
                    <span class="user-email">${this.currentUser.email}</span>
                    <span class="user-credits">积分: ${this.userCredits.toFixed(2)}</span>
                    <button onclick="authManager.showUserCenter()" class="btn-user-center">用户中心</button>
                    <button onclick="authManager.signOut()" class="btn-signout">登出</button>
                `;
            } else {
                userInfoElement.innerHTML = `
                    <button onclick="authManager.showLoginModal()" class="btn-login">登录</button>
                    <button onclick="authManager.showSignupModal()" class="btn-signup">注册</button>
                `;
            }
        }
    }

    showLoginModal() {
        const modal = document.getElementById('authModal');
        const modalTitle = document.getElementById('authModalTitle');
        const authForm = document.getElementById('authForm');
        
        modalTitle.textContent = '登录';
        authForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;
            
            try {
                await this.signIn(email, password);
                modal.style.display = 'none';
                console.log('登录成功');
            } catch (error) {
                alert('登录失败: ' + error.message);
            }
        };
        
        modal.style.display = 'flex';
    }

    showSignupModal() {
        const modal = document.getElementById('authModal');
        const modalTitle = document.getElementById('authModalTitle');
        const authForm = document.getElementById('authForm');
        
        modalTitle.textContent = '注册';
        authForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;
            
            try {
                await this.signUp(email, password);
                modal.style.display = 'none';
                alert('注册成功！请查收邮件验证账户。');
            } catch (error) {
                alert('注册失败: ' + error.message);
            }
        };
        
        modal.style.display = 'flex';
    }

    showUserCenter() {
        const modal = document.getElementById('userCenterModal');
        this.loadTransactionHistory();
        modal.style.display = 'flex';
    }

    async loadTransactionHistory() {
        if (!this.supabase || !this.currentUser) return;

        try {
            const { data, error } = await this.supabase
                .from('credit_transactions')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) {
                console.error('加载交易历史失败:', error);
                return;
            }

            const historyList = document.getElementById('transactionHistory');
            if (historyList && data) {
                historyList.innerHTML = data.map(tx => `
                    <div class="transaction-item">
                        <span class="tx-date">${new Date(tx.created_at).toLocaleString('zh-CN')}</span>
                        <span class="tx-desc">${tx.description}</span>
                        <span class="tx-amount ${tx.amount < 0 ? 'negative' : 'positive'}">${tx.amount > 0 ? '+' : ''}${tx.amount.toFixed(2)}</span>
                        <span class="tx-balance">余额: ${tx.balance_after.toFixed(2)}</span>
                    </div>
                `).join('');
            }
        } catch (err) {
            console.error('加载交易历史异常:', err);
        }
    }
}

// 创建全局实例
let authManager;
if (typeof window !== 'undefined') {
    authManager = new AuthManager();
}
