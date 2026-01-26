// 多语言国际化系统
class I18n {
    constructor() {
        this.currentLang = this.detectLanguage();
        this.translations = this.getTranslations();
        this.init();
    }

    // 检测用户语言
    detectLanguage() {
        // 1. 检查localStorage中保存的语言
        const savedLang = localStorage.getItem('ai3d_language');
        if (savedLang) return savedLang;

        // 2. 检测浏览器语言
        const browserLang = navigator.language || navigator.userLanguage;
        
        // 语言映射
        const langMap = {
            'zh-CN': 'zh-CN',
            'zh-TW': 'zh-TW',
            'zh-HK': 'zh-TW',
            'zh': 'zh-CN',
            'en': 'en',
            'en-US': 'en',
            'en-GB': 'en',
            'ja': 'ja',
            'ja-JP': 'ja',
            'ko': 'ko',
            'ko-KR': 'ko',
            'de': 'de',
            'de-DE': 'de',
            'fr': 'fr',
            'fr-FR': 'fr',
            'es': 'es',
            'es-ES': 'es',
            'it': 'it',
            'it-IT': 'it',
            'pt': 'pt',
            'pt-BR': 'pt',
            'pt-PT': 'pt',
            'vi': 'vi',
            'vi-VN': 'vi',
            'ar': 'ar'
        };

        return langMap[browserLang] || 'en';
    }

    // 获取所有翻译
    getTranslations() {
        return {
            'zh-CN': {
                // 导航栏
                'nav.file': '文件',
                'nav.export': '导出',
                'nav.import': '导入',
                'nav.settings': '设置',
                'nav.newProject': '新建项目',
                'nav.openFile': '打开文件',
                'nav.saveProject': '保存项目',
                'nav.saveAs': '另存为',
                'nav.exportSTEP': 'STEP (.step)',
                'nav.exportSTL': 'STL (.stl)',
                'nav.exportOBJ': 'OBJ (.obj)',
                'nav.importSTEP': 'STEP/IGES (.step, .igs)',
                'nav.importSTL': 'STL (.stl)',
                'nav.clearImports': '清除所有导入',
                'nav.resetLayout': '恢复界面布局',
                'nav.themeSettings': '主题设置',
                'nav.preferences': '偏好设置',
                'nav.about': '关于',
                'nav.formatIndustrial': '工业标准',
                'nav.format3DPrint': '3D打印',
                'nav.formatGeneral': '通用格式',
                
                // 标签页
                'tab.3dView': '3D 视图',
                'tab.codeEditor': '代码编辑器',
                'tab.aiGenerator': 'AI 生成器',
                
                // AI模块
                'ai.title': 'AI 模型描述',
                'ai.placeholder': '用自然语言描述你想要的 3D 模型，例如：创建一个边长100的立方体，中间挖一个半径30的球形孔',
                'ai.generate': '生成模型',
                'ai.historyTitle': 'AI 生成历史',
                'ai.refresh': '刷新',
                'ai.loadModel': '加载模型',
                'ai.edit': '编辑描述',
                'ai.delete': '删除记录',
                'ai.noHistory': '暂无生成记录',
                'ai.noHistoryDesc': '开始使用AI生成功能后，历史记录将显示在这里',
                'ai.loading': '加载中...',
                'ai.loadFailed': '加载失败',
                'ai.pleaseLogin': '请先登录',
                'ai.loginDesc': '登录后可查看AI生成历史记录',
                'ai.loginNow': '立即登录',
                
                // 认证
                'auth.login': '登录',
                'auth.signup': '注册',
                'auth.loginTitle': '登录账户',
                'auth.signupTitle': '创建账户',
                'auth.email': '邮箱',
                'auth.password': '密码',
                'auth.confirmPassword': '确认密码',
                'auth.emailPlaceholder': '请输入邮箱地址',
                'auth.passwordPlaceholder': '请输入密码',
                'auth.passwordMinPlaceholder': '至少6位字符',
                'auth.confirmPasswordPlaceholder': '再次输入密码',
                
                // 用户中心
                'user.center': '用户中心',
                'user.info': '个人信息',
                'user.credits': '我的积分',
                'user.history': '生成记录',
                'user.emailLabel': '邮箱',
                'user.registeredAt': '注册时间',
                'user.availableCredits': '可用积分',
                'user.recharge': '充值积分',
                'user.logout': '退出登录',
                
                // 消息
                'msg.confirmNewProject': '确定要创建新项目吗？未保存的更改将丢失。',
                'msg.confirmResetLayout': '确定要恢复默认界面布局吗？当前布局设置将被重置。',
                'msg.confirmDelete': '确定要删除这条记录吗？此操作无法撤销。',
                'msg.saved': '已保存',
                'msg.generating': '生成中...',
                'msg.welcome': '欢迎使用 AI 3D Studio！',
                'msg.loadingKernel': '加载 CAD 内核...',
                
                // 其他
                'common.close': '关闭',
                'common.cancel': '取消',
                'common.confirm': '确认',
                'common.save': '保存',
                'common.delete': '删除',
                'common.edit': '编辑',
                'common.loading': '加载中',
                'common.error': '错误',
                'common.success': '成功'
            },
            'zh-TW': {
                // 導航欄
                'nav.file': '檔案',
                'nav.export': '匯出',
                'nav.import': '匯入',
                'nav.settings': '設定',
                'nav.newProject': '新建專案',
                'nav.openFile': '開啟檔案',
                'nav.saveProject': '儲存專案',
                'nav.saveAs': '另存新檔',
                'nav.exportSTEP': 'STEP (.step)',
                'nav.exportSTL': 'STL (.stl)',
                'nav.exportOBJ': 'OBJ (.obj)',
                'nav.importSTEP': 'STEP/IGES (.step, .igs)',
                'nav.importSTL': 'STL (.stl)',
                'nav.clearImports': '清除所有匯入',
                'nav.resetLayout': '恢復介面佈局',
                'nav.themeSettings': '主題設定',
                'nav.preferences': '偏好設定',
                'nav.about': '關於',
                'nav.formatIndustrial': '工業標準',
                'nav.format3DPrint': '3D列印',
                'nav.formatGeneral': '通用格式',
                
                // 標籤頁
                'tab.3dView': '3D 視圖',
                'tab.codeEditor': '程式碼編輯器',
                'tab.aiGenerator': 'AI 生成器',
                
                // AI模組
                'ai.title': 'AI 模型描述',
                'ai.placeholder': '用自然語言描述你想要的 3D 模型，例如：建立一個邊長100的立方體，中間挖一個半徑30的球形孔',
                'ai.generate': '生成模型',
                'ai.historyTitle': 'AI 生成歷史',
                'ai.refresh': '重新整理',
                'ai.loadModel': '載入模型',
                'ai.edit': '編輯描述',
                'ai.delete': '刪除記錄',
                'ai.noHistory': '暫無生成記錄',
                'ai.noHistoryDesc': '開始使用AI生成功能後，歷史記錄將顯示在這裡',
                'ai.loading': '載入中...',
                'ai.loadFailed': '載入失敗',
                'ai.pleaseLogin': '請先登入',
                'ai.loginDesc': '登入後可查看AI生成歷史記錄',
                'ai.loginNow': '立即登入',
                
                // 認證
                'auth.login': '登入',
                'auth.signup': '註冊',
                'auth.loginTitle': '登入帳戶',
                'auth.signupTitle': '建立帳戶',
                'auth.email': '電子郵件',
                'auth.password': '密碼',
                'auth.confirmPassword': '確認密碼',
                'auth.emailPlaceholder': '請輸入電子郵件地址',
                'auth.passwordPlaceholder': '請輸入密碼',
                'auth.passwordMinPlaceholder': '至少6位字元',
                'auth.confirmPasswordPlaceholder': '再次輸入密碼',
                
                // 使用者中心
                'user.center': '使用者中心',
                'user.info': '個人資訊',
                'user.credits': '我的積分',
                'user.history': '生成記錄',
                'user.emailLabel': '電子郵件',
                'user.registeredAt': '註冊時間',
                'user.availableCredits': '可用積分',
                'user.recharge': '儲值積分',
                'user.logout': '登出',
                
                // 訊息
                'msg.confirmNewProject': '確定要建立新專案嗎？未儲存的變更將遺失。',
                'msg.confirmResetLayout': '確定要恢復預設介面佈局嗎？目前佈局設定將被重設。',
                'msg.confirmDelete': '確定要刪除這條記錄嗎？此操作無法復原。',
                'msg.saved': '已儲存',
                'msg.generating': '生成中...',
                'msg.welcome': '歡迎使用 AI 3D Studio！',
                'msg.loadingKernel': '載入 CAD 核心...',
                
                // 其他
                'common.close': '關閉',
                'common.cancel': '取消',
                'common.confirm': '確認',
                'common.save': '儲存',
                'common.delete': '刪除',
                'common.edit': '編輯',
                'common.loading': '載入中',
                'common.error': '錯誤',
                'common.success': '成功'
            },
            'en': {
                'nav.file': 'File',
                'nav.export': 'Export',
                'nav.import': 'Import',
                'nav.settings': 'Settings',
                'nav.newProject': 'New Project',
                'nav.openFile': 'Open File',
                'nav.saveProject': 'Save Project',
                'nav.saveAs': 'Save As',
                'nav.exportSTEP': 'STEP (.step)',
                'nav.exportSTL': 'STL (.stl)',
                'nav.exportOBJ': 'OBJ (.obj)',
                'nav.importSTEP': 'STEP/IGES (.step, .igs)',
                'nav.importSTL': 'STL (.stl)',
                'nav.clearImports': 'Clear All Imports',
                'nav.resetLayout': 'Reset Layout',
                'nav.themeSettings': 'Theme Settings',
                'nav.preferences': 'Preferences',
                'nav.about': 'About',
                'nav.formatIndustrial': 'Industrial Standard',
                'nav.format3DPrint': '3D Printing',
                'nav.formatGeneral': 'General Format',
                'tab.3dView': '3D View',
                'tab.codeEditor': 'Code Editor',
                'tab.aiGenerator': 'AI Generator',
                'ai.title': 'AI Model Description',
                'ai.placeholder': 'Describe your 3D model in natural language, e.g.: Create a cube with side length 100, with a spherical hole of radius 30 in the center',
                'ai.generate': 'Generate Model',
                'ai.historyTitle': 'AI Generation History',
                'ai.refresh': 'Refresh',
                'ai.loadModel': 'Load Model',
                'ai.noHistory': 'No generation history',
                'auth.login': 'Login',
                'auth.signup': 'Sign Up',
                'auth.loginTitle': 'Login Account',
                'auth.signupTitle': 'Create Account',
                'auth.email': 'Email',
                'auth.password': 'Password',
                'user.center': 'User Center',
                'user.logout': 'Logout'
            },
            'ja': {
                // 導航栏
                'nav.file': 'ファイル',
                'nav.export': 'エクスポート',
                'nav.import': 'インポート',
                'nav.settings': '設定',
                'nav.newProject': '新規プロジェクト',
                'nav.openFile': 'ファイルを開く',
                'nav.saveProject': 'プロジェクトを保存',
                'nav.saveAs': '名前を付けて保存',
                'nav.exportSTEP': 'STEP (.step)',
                'nav.exportSTL': 'STL (.stl)',
                'nav.exportOBJ': 'OBJ (.obj)',
                'nav.importSTEP': 'STEP/IGES (.step, .igs)',
                'nav.importSTL': 'STL (.stl)',
                'nav.clearImports': 'すべてのインポートをクリア',
                'nav.resetLayout': 'レイアウトをリセット',
                'nav.themeSettings': 'テーマ設定',
                'nav.preferences': '環境設定',
                'nav.about': 'について',
                'nav.formatIndustrial': '産業標準',
                'nav.format3DPrint': '3Dプリント',
                'nav.formatGeneral': '汎用フォーマット',
                
                // タブ
                'tab.3dView': '3D ビュー',
                'tab.codeEditor': 'コードエディタ',
                'tab.aiGenerator': 'AI ジェネレーター',
                
                // AIモジュール
                'ai.title': 'AI モデル説明',
                'ai.placeholder': '自然言語で3Dモデルを説明してください。例：辺の長さ100の立方体を作成し、中心に半径30の球形の穴を開ける',
                'ai.generate': 'モデルを生成',
                'ai.historyTitle': 'AI 生成履歴',
                'ai.refresh': '更新',
                'ai.loadModel': 'モデルを読み込む',
                'ai.edit': '説明を編集',
                'ai.delete': '記録を削除',
                'ai.noHistory': '生成履歴がありません',
                'ai.noHistoryDesc': 'AI生成機能を使用すると、履歴がここに表示されます',
                'ai.loading': '読み込み中...',
                'ai.loadFailed': '読み込みに失敗しました',
                'ai.pleaseLogin': 'ログインしてください',
                'ai.loginDesc': 'ログイン後、AI生成履歴を表示できます',
                'ai.loginNow': '今すぐログイン',
                
                // 認証
                'auth.login': 'ログイン',
                'auth.signup': '登録',
                'auth.loginTitle': 'アカウントにログイン',
                'auth.signupTitle': 'アカウントを作成',
                'auth.email': 'メールアドレス',
                'auth.password': 'パスワード',
                'auth.confirmPassword': 'パスワードを確認',
                'auth.emailPlaceholder': 'メールアドレスを入力',
                'auth.passwordPlaceholder': 'パスワードを入力',
                'auth.passwordMinPlaceholder': '6文字以上',
                'auth.confirmPasswordPlaceholder': 'パスワードを再入力',
                
                // ユーザーセンター
                'user.center': 'ユーザーセンター',
                'user.info': '個人情報',
                'user.credits': 'マイクレジット',
                'user.history': '生成履歴',
                'user.emailLabel': 'メールアドレス',
                'user.registeredAt': '登録日時',
                'user.availableCredits': '利用可能なクレジット',
                'user.recharge': 'クレジットをチャージ',
                'user.logout': 'ログアウト',
                
                // メッセージ
                'msg.confirmNewProject': '新しいプロジェクトを作成しますか？保存されていない変更は失われます。',
                'msg.confirmResetLayout': 'デフォルトのレイアウトに戻しますか？現在のレイアウト設定はリセットされます。',
                'msg.confirmDelete': 'この記録を削除してもよろしいですか？この操作は元に戻せません。',
                'msg.saved': '保存しました',
                'msg.generating': '生成中...',
                'msg.welcome': 'AI 3D Studioへようこそ！',
                'msg.loadingKernel': 'CADカーネルを読み込み中...',
                
                // その他
                'common.close': '閉じる',
                'common.cancel': 'キャンセル',
                'common.confirm': '確認',
                'common.save': '保存',
                'common.delete': '削除',
                'common.edit': '編集',
                'common.loading': '読み込み中',
                'common.error': 'エラー',
                'common.success': '成功'
            },
            'ko': {
                // 내비게이션
                'nav.file': '파일',
                'nav.export': '내보내기',
                'nav.import': '가져오기',
                'nav.settings': '설정',
                'nav.newProject': '새 프로젝트',
                'nav.openFile': '파일 열기',
                'nav.saveProject': '프로젝트 저장',
                'nav.saveAs': '다른 이름으로 저장',
                'nav.exportSTEP': 'STEP (.step)',
                'nav.exportSTL': 'STL (.stl)',
                'nav.exportOBJ': 'OBJ (.obj)',
                'nav.importSTEP': 'STEP/IGES (.step, .igs)',
                'nav.importSTL': 'STL (.stl)',
                'nav.clearImports': '모든 가져오기 지우기',
                'nav.resetLayout': '레이아웃 재설정',
                'nav.themeSettings': '테마 설정',
                'nav.preferences': '환경설정',
                'nav.about': '정보',
                'nav.formatIndustrial': '산업 표준',
                'nav.format3DPrint': '3D 프린팅',
                'nav.formatGeneral': '일반 형식',
                
                // 탭
                'tab.3dView': '3D 뷰',
                'tab.codeEditor': '코드 편집기',
                'tab.aiGenerator': 'AI 생성기',
                
                // AI 모듈
                'ai.title': 'AI 모델 설명',
                'ai.placeholder': '자연어로 3D 모델을 설명하세요. 예: 변의 길이가 100인 정육면체를 만들고 중앙에 반지름 30의 구형 구멍을 뚫습니다',
                'ai.generate': '모델 생성',
                'ai.historyTitle': 'AI 생성 기록',
                'ai.refresh': '새로고침',
                'ai.loadModel': '모델 불러오기',
                'ai.edit': '설명 편집',
                'ai.delete': '기록 삭제',
                'ai.noHistory': '생성 기록이 없습니다',
                'ai.noHistoryDesc': 'AI 생성 기능을 사용하면 기록이 여기에 표시됩니다',
                'ai.loading': '로딩 중...',
                'ai.loadFailed': '로드 실패',
                'ai.pleaseLogin': '먼저 로그인하세요',
                'ai.loginDesc': '로그인 후 AI 생성 기록을 볼 수 있습니다',
                'ai.loginNow': '지금 로그인',
                
                // 인증
                'auth.login': '로그인',
                'auth.signup': '회원가입',
                'auth.loginTitle': '계정 로그인',
                'auth.signupTitle': '계정 만들기',
                'auth.email': '이메일',
                'auth.password': '비밀번호',
                'auth.confirmPassword': '비밀번호 확인',
                'auth.emailPlaceholder': '이메일 주소를 입력하세요',
                'auth.passwordPlaceholder': '비밀번호를 입력하세요',
                'auth.passwordMinPlaceholder': '최소 6자',
                'auth.confirmPasswordPlaceholder': '비밀번호를 다시 입력하세요',
                
                // 사용자 센터
                'user.center': '사용자 센터',
                'user.info': '개인 정보',
                'user.credits': '내 크레딧',
                'user.history': '생성 기록',
                'user.emailLabel': '이메일',
                'user.registeredAt': '가입일',
                'user.availableCredits': '사용 가능한 크레딧',
                'user.recharge': '크레딧 충전',
                'user.logout': '로그아웃',
                
                // 메시지
                'msg.confirmNewProject': '새 프로젝트를 만드시겠습니까? 저장하지 않은 변경사항은 손실됩니다.',
                'msg.confirmResetLayout': '기본 레이아웃으로 복원하시겠습니까? 현재 레이아웃 설정이 재설정됩니다.',
                'msg.confirmDelete': '이 기록을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.',
                'msg.saved': '저장됨',
                'msg.generating': '생성 중...',
                'msg.welcome': 'AI 3D Studio에 오신 것을 환영합니다!',
                'msg.loadingKernel': 'CAD 커널 로딩 중...',
                
                // 기타
                'common.close': '닫기',
                'common.cancel': '취소',
                'common.confirm': '확인',
                'common.save': '저장',
                'common.delete': '삭제',
                'common.edit': '편집',
                'common.loading': '로딩 중',
                'common.error': '오류',
                'common.success': '성공'
            },
            'de': {
                // Navigation
                'nav.file': 'Datei',
                'nav.export': 'Exportieren',
                'nav.import': 'Importieren',
                'nav.settings': 'Einstellungen',
                'nav.newProject': 'Neues Projekt',
                'nav.openFile': 'Datei öffnen',
                'nav.saveProject': 'Projekt speichern',
                'nav.saveAs': 'Speichern unter',
                'nav.exportSTEP': 'STEP (.step)',
                'nav.exportSTL': 'STL (.stl)',
                'nav.exportOBJ': 'OBJ (.obj)',
                'nav.importSTEP': 'STEP/IGES (.step, .igs)',
                'nav.importSTL': 'STL (.stl)',
                'nav.clearImports': 'Alle Importe löschen',
                'nav.resetLayout': 'Layout zurücksetzen',
                'nav.themeSettings': 'Theme-Einstellungen',
                'nav.preferences': 'Einstellungen',
                'nav.about': 'Über',
                'nav.formatIndustrial': 'Industriestandard',
                'nav.format3DPrint': '3D-Druck',
                'nav.formatGeneral': 'Allgemeines Format',
                
                // Tabs
                'tab.3dView': '3D-Ansicht',
                'tab.codeEditor': 'Code-Editor',
                'tab.aiGenerator': 'KI-Generator',
                
                // KI-Modul
                'ai.title': 'KI-Modellbeschreibung',
                'ai.placeholder': 'Beschreiben Sie Ihr 3D-Modell in natürlicher Sprache, z.B.: Erstellen Sie einen Würfel mit Kantenlänge 100 und einem kugelförmigen Loch mit Radius 30 in der Mitte',
                'ai.generate': 'Modell generieren',
                'ai.historyTitle': 'KI-Generierungsverlauf',
                'ai.refresh': 'Aktualisieren',
                'ai.loadModel': 'Modell laden',
                'ai.edit': 'Beschreibung bearbeiten',
                'ai.delete': 'Eintrag löschen',
                'ai.noHistory': 'Kein Generierungsverlauf',
                'ai.noHistoryDesc': 'Nach der Verwendung der KI-Generierung wird der Verlauf hier angezeigt',
                'ai.loading': 'Wird geladen...',
                'ai.loadFailed': 'Laden fehlgeschlagen',
                'ai.pleaseLogin': 'Bitte melden Sie sich an',
                'ai.loginDesc': 'Nach der Anmeldung können Sie den KI-Generierungsverlauf anzeigen',
                'ai.loginNow': 'Jetzt anmelden',
                
                // Authentifizierung
                'auth.login': 'Anmelden',
                'auth.signup': 'Registrieren',
                'auth.loginTitle': 'Konto anmelden',
                'auth.signupTitle': 'Konto erstellen',
                'auth.email': 'E-Mail',
                'auth.password': 'Passwort',
                'auth.confirmPassword': 'Passwort bestätigen',
                'auth.emailPlaceholder': 'E-Mail-Adresse eingeben',
                'auth.passwordPlaceholder': 'Passwort eingeben',
                'auth.passwordMinPlaceholder': 'Mindestens 6 Zeichen',
                'auth.confirmPasswordPlaceholder': 'Passwort erneut eingeben',
                
                // Benutzerzentrum
                'user.center': 'Benutzerzentrum',
                'user.info': 'Persönliche Informationen',
                'user.credits': 'Meine Credits',
                'user.history': 'Generierungsverlauf',
                'user.emailLabel': 'E-Mail',
                'user.registeredAt': 'Registrierungsdatum',
                'user.availableCredits': 'Verfügbare Credits',
                'user.recharge': 'Credits aufladen',
                'user.logout': 'Abmelden',
                
                // Nachrichten
                'msg.confirmNewProject': 'Möchten Sie ein neues Projekt erstellen? Nicht gespeicherte Änderungen gehen verloren.',
                'msg.confirmResetLayout': 'Möchten Sie das Standard-Layout wiederherstellen? Die aktuellen Layout-Einstellungen werden zurückgesetzt.',
                'msg.confirmDelete': 'Möchten Sie diesen Eintrag wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
                'msg.saved': 'Gespeichert',
                'msg.generating': 'Wird generiert...',
                'msg.welcome': 'Willkommen bei AI 3D Studio!',
                'msg.loadingKernel': 'CAD-Kernel wird geladen...',
                
                // Sonstiges
                'common.close': 'Schließen',
                'common.cancel': 'Abbrechen',
                'common.confirm': 'Bestätigen',
                'common.save': 'Speichern',
                'common.delete': 'Löschen',
                'common.edit': 'Bearbeiten',
                'common.loading': 'Wird geladen',
                'common.error': 'Fehler',
                'common.success': 'Erfolg'
            },
            'fr': {
                // Navigation
                'nav.file': 'Fichier',
                'nav.export': 'Exporter',
                'nav.import': 'Importer',
                'nav.settings': 'Paramètres',
                'nav.newProject': 'Nouveau projet',
                'nav.openFile': 'Ouvrir un fichier',
                'nav.saveProject': 'Enregistrer le projet',
                'nav.saveAs': 'Enregistrer sous',
                'nav.exportSTEP': 'STEP (.step)',
                'nav.exportSTL': 'STL (.stl)',
                'nav.exportOBJ': 'OBJ (.obj)',
                'nav.importSTEP': 'STEP/IGES (.step, .igs)',
                'nav.importSTL': 'STL (.stl)',
                'nav.clearImports': 'Effacer toutes les importations',
                'nav.resetLayout': 'Réinitialiser la disposition',
                'nav.themeSettings': 'Paramètres du thème',
                'nav.preferences': 'Préférences',
                'nav.about': 'À propos',
                'nav.formatIndustrial': 'Standard industriel',
                'nav.format3DPrint': 'Impression 3D',
                'nav.formatGeneral': 'Format général',
                
                // Onglets
                'tab.3dView': 'Vue 3D',
                'tab.codeEditor': 'Éditeur de code',
                'tab.aiGenerator': 'Générateur IA',
                
                // Module IA
                'ai.title': 'Description du modèle IA',
                'ai.placeholder': 'Décrivez votre modèle 3D en langage naturel, par exemple : Créer un cube de côté 100 avec un trou sphérique de rayon 30 au centre',
                'ai.generate': 'Générer le modèle',
                'ai.historyTitle': 'Historique de génération IA',
                'ai.refresh': 'Actualiser',
                'ai.loadModel': 'Charger le modèle',
                'ai.edit': 'Modifier la description',
                'ai.delete': 'Supprimer l\'enregistrement',
                'ai.noHistory': 'Aucun historique de génération',
                'ai.noHistoryDesc': 'Après avoir utilisé la fonction de génération IA, l\'historique s\'affichera ici',
                'ai.loading': 'Chargement...',
                'ai.loadFailed': 'Échec du chargement',
                'ai.pleaseLogin': 'Veuillez vous connecter',
                'ai.loginDesc': 'Après connexion, vous pourrez voir l\'historique de génération IA',
                'ai.loginNow': 'Se connecter maintenant',
                
                // Authentification
                'auth.login': 'Connexion',
                'auth.signup': 'S\'inscrire',
                'auth.loginTitle': 'Se connecter au compte',
                'auth.signupTitle': 'Créer un compte',
                'auth.email': 'E-mail',
                'auth.password': 'Mot de passe',
                'auth.confirmPassword': 'Confirmer le mot de passe',
                'auth.emailPlaceholder': 'Entrez l\'adresse e-mail',
                'auth.passwordPlaceholder': 'Entrez le mot de passe',
                'auth.passwordMinPlaceholder': 'Au moins 6 caractères',
                'auth.confirmPasswordPlaceholder': 'Entrez à nouveau le mot de passe',
                
                // Centre utilisateur
                'user.center': 'Centre utilisateur',
                'user.info': 'Informations personnelles',
                'user.credits': 'Mes crédits',
                'user.history': 'Historique de génération',
                'user.emailLabel': 'E-mail',
                'user.registeredAt': 'Date d\'inscription',
                'user.availableCredits': 'Crédits disponibles',
                'user.recharge': 'Recharger les crédits',
                'user.logout': 'Déconnexion',
                
                // Messages
                'msg.confirmNewProject': 'Voulez-vous créer un nouveau projet ? Les modifications non enregistrées seront perdues.',
                'msg.confirmResetLayout': 'Voulez-vous restaurer la disposition par défaut ? Les paramètres de disposition actuels seront réinitialisés.',
                'msg.confirmDelete': 'Voulez-vous vraiment supprimer cet enregistrement ? Cette action ne peut pas être annulée.',
                'msg.saved': 'Enregistré',
                'msg.generating': 'Génération en cours...',
                'msg.welcome': 'Bienvenue sur AI 3D Studio !',
                'msg.loadingKernel': 'Chargement du noyau CAD...',
                
                // Divers
                'common.close': 'Fermer',
                'common.cancel': 'Annuler',
                'common.confirm': 'Confirmer',
                'common.save': 'Enregistrer',
                'common.delete': 'Supprimer',
                'common.edit': 'Modifier',
                'common.loading': 'Chargement',
                'common.error': 'Erreur',
                'common.success': 'Succès'
            },
            'es': {
                // Navegación
                'nav.file': 'Archivo',
                'nav.export': 'Exportar',
                'nav.import': 'Importar',
                'nav.settings': 'Configuración',
                'nav.newProject': 'Nuevo proyecto',
                'nav.openFile': 'Abrir archivo',
                'nav.saveProject': 'Guardar proyecto',
                'nav.saveAs': 'Guardar como',
                'nav.exportSTEP': 'STEP (.step)',
                'nav.exportSTL': 'STL (.stl)',
                'nav.exportOBJ': 'OBJ (.obj)',
                'nav.importSTEP': 'STEP/IGES (.step, .igs)',
                'nav.importSTL': 'STL (.stl)',
                'nav.clearImports': 'Borrar todas las importaciones',
                'nav.resetLayout': 'Restablecer diseño',
                'nav.themeSettings': 'Configuración del tema',
                'nav.preferences': 'Preferencias',
                'nav.about': 'Acerca de',
                'nav.formatIndustrial': 'Estándar industrial',
                'nav.format3DPrint': 'Impresión 3D',
                'nav.formatGeneral': 'Formato general',
                
                // Pestañas
                'tab.3dView': 'Vista 3D',
                'tab.codeEditor': 'Editor de código',
                'tab.aiGenerator': 'Generador IA',
                
                // Módulo IA
                'ai.title': 'Descripción del modelo IA',
                'ai.placeholder': 'Describe tu modelo 3D en lenguaje natural, por ejemplo: Crear un cubo con lado de 100, con un agujero esférico de radio 30 en el centro',
                'ai.generate': 'Generar modelo',
                'ai.historyTitle': 'Historial de generación IA',
                'ai.refresh': 'Actualizar',
                'ai.loadModel': 'Cargar modelo',
                'ai.edit': 'Editar descripción',
                'ai.delete': 'Eliminar registro',
                'ai.noHistory': 'Sin historial de generación',
                'ai.noHistoryDesc': 'Después de usar la función de generación IA, el historial se mostrará aquí',
                'ai.loading': 'Cargando...',
                'ai.loadFailed': 'Error al cargar',
                'ai.pleaseLogin': 'Por favor inicia sesión',
                'ai.loginDesc': 'Después de iniciar sesión, podrás ver el historial de generación IA',
                'ai.loginNow': 'Iniciar sesión ahora',
                
                // Autenticación
                'auth.login': 'Iniciar sesión',
                'auth.signup': 'Registrarse',
                'auth.loginTitle': 'Iniciar sesión en la cuenta',
                'auth.signupTitle': 'Crear cuenta',
                'auth.email': 'Correo electrónico',
                'auth.password': 'Contraseña',
                'auth.confirmPassword': 'Confirmar contraseña',
                'auth.emailPlaceholder': 'Ingresa tu correo electrónico',
                'auth.passwordPlaceholder': 'Ingresa tu contraseña',
                'auth.passwordMinPlaceholder': 'Al menos 6 caracteres',
                'auth.confirmPasswordPlaceholder': 'Ingresa la contraseña nuevamente',
                
                // Centro de usuario
                'user.center': 'Centro de usuario',
                'user.info': 'Información personal',
                'user.credits': 'Mis créditos',
                'user.history': 'Historial de generación',
                'user.emailLabel': 'Correo electrónico',
                'user.registeredAt': 'Fecha de registro',
                'user.availableCredits': 'Créditos disponibles',
                'user.recharge': 'Recargar créditos',
                'user.logout': 'Cerrar sesión',
                
                // Mensajes
                'msg.confirmNewProject': '¿Deseas crear un nuevo proyecto? Los cambios no guardados se perderán.',
                'msg.confirmResetLayout': '¿Deseas restaurar el diseño predeterminado? La configuración actual del diseño se restablecerá.',
                'msg.confirmDelete': '¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.',
                'msg.saved': 'Guardado',
                'msg.generating': 'Generando...',
                'msg.welcome': '¡Bienvenido a AI 3D Studio!',
                'msg.loadingKernel': 'Cargando núcleo CAD...',
                
                // Varios
                'common.close': 'Cerrar',
                'common.cancel': 'Cancelar',
                'common.confirm': 'Confirmar',
                'common.save': 'Guardar',
                'common.delete': 'Eliminar',
                'common.edit': 'Editar',
                'common.loading': 'Cargando',
                'common.error': 'Error',
                'common.success': 'Éxito'
            },
            'it': {
                // Navigazione
                'nav.file': 'File',
                'nav.export': 'Esporta',
                'nav.import': 'Importa',
                'nav.settings': 'Impostazioni',
                'nav.newProject': 'Nuovo progetto',
                'nav.openFile': 'Apri file',
                'nav.saveProject': 'Salva progetto',
                'nav.saveAs': 'Salva come',
                'nav.exportSTEP': 'STEP (.step)',
                'nav.exportSTL': 'STL (.stl)',
                'nav.exportOBJ': 'OBJ (.obj)',
                'nav.importSTEP': 'STEP/IGES (.step, .igs)',
                'nav.importSTL': 'STL (.stl)',
                'nav.clearImports': 'Cancella tutte le importazioni',
                'nav.resetLayout': 'Ripristina layout',
                'nav.themeSettings': 'Impostazioni tema',
                'nav.preferences': 'Preferenze',
                'nav.about': 'Informazioni',
                'nav.formatIndustrial': 'Standard industriale',
                'nav.format3DPrint': 'Stampa 3D',
                'nav.formatGeneral': 'Formato generale',
                
                // Schede
                'tab.3dView': 'Vista 3D',
                'tab.codeEditor': 'Editor di codice',
                'tab.aiGenerator': 'Generatore IA',
                
                // Modulo IA
                'ai.title': 'Descrizione modello IA',
                'ai.placeholder': 'Descrivi il tuo modello 3D in linguaggio naturale, ad esempio: Crea un cubo con lato 100, con un foro sferico di raggio 30 al centro',
                'ai.generate': 'Genera modello',
                'ai.historyTitle': 'Cronologia generazione IA',
                'ai.refresh': 'Aggiorna',
                'ai.loadModel': 'Carica modello',
                'ai.edit': 'Modifica descrizione',
                'ai.delete': 'Elimina record',
                'ai.noHistory': 'Nessuna cronologia di generazione',
                'ai.noHistoryDesc': 'Dopo aver utilizzato la funzione di generazione IA, la cronologia verrà visualizzata qui',
                'ai.loading': 'Caricamento...',
                'ai.loadFailed': 'Caricamento fallito',
                'ai.pleaseLogin': 'Effettua il login',
                'ai.loginDesc': 'Dopo il login, potrai visualizzare la cronologia di generazione IA',
                'ai.loginNow': 'Accedi ora',
                
                // Autenticazione
                'auth.login': 'Accedi',
                'auth.signup': 'Registrati',
                'auth.loginTitle': 'Accedi all\'account',
                'auth.signupTitle': 'Crea account',
                'auth.email': 'Email',
                'auth.password': 'Password',
                'auth.confirmPassword': 'Conferma password',
                'auth.emailPlaceholder': 'Inserisci l\'indirizzo email',
                'auth.passwordPlaceholder': 'Inserisci la password',
                'auth.passwordMinPlaceholder': 'Almeno 6 caratteri',
                'auth.confirmPasswordPlaceholder': 'Inserisci nuovamente la password',
                
                // Centro utente
                'user.center': 'Centro utente',
                'user.info': 'Informazioni personali',
                'user.credits': 'I miei crediti',
                'user.history': 'Cronologia generazione',
                'user.emailLabel': 'Email',
                'user.registeredAt': 'Data di registrazione',
                'user.availableCredits': 'Crediti disponibili',
                'user.recharge': 'Ricarica crediti',
                'user.logout': 'Esci',
                
                // Messaggi
                'msg.confirmNewProject': 'Vuoi creare un nuovo progetto? Le modifiche non salvate andranno perse.',
                'msg.confirmResetLayout': 'Vuoi ripristinare il layout predefinito? Le impostazioni del layout corrente verranno ripristinate.',
                'msg.confirmDelete': 'Sei sicuro di voler eliminare questo record? Questa azione non può essere annullata.',
                'msg.saved': 'Salvato',
                'msg.generating': 'Generazione in corso...',
                'msg.welcome': 'Benvenuto in AI 3D Studio!',
                'msg.loadingKernel': 'Caricamento kernel CAD...',
                
                // Varie
                'common.close': 'Chiudi',
                'common.cancel': 'Annulla',
                'common.confirm': 'Conferma',
                'common.save': 'Salva',
                'common.delete': 'Elimina',
                'common.edit': 'Modifica',
                'common.loading': 'Caricamento',
                'common.error': 'Errore',
                'common.success': 'Successo'
            },
            'pt': {
                // Navegação
                'nav.file': 'Arquivo',
                'nav.export': 'Exportar',
                'nav.import': 'Importar',
                'nav.settings': 'Configurações',
                'nav.newProject': 'Novo projeto',
                'nav.openFile': 'Abrir arquivo',
                'nav.saveProject': 'Salvar projeto',
                'nav.saveAs': 'Salvar como',
                'nav.exportSTEP': 'STEP (.step)',
                'nav.exportSTL': 'STL (.stl)',
                'nav.exportOBJ': 'OBJ (.obj)',
                'nav.importSTEP': 'STEP/IGES (.step, .igs)',
                'nav.importSTL': 'STL (.stl)',
                'nav.clearImports': 'Limpar todas as importações',
                'nav.resetLayout': 'Redefinir layout',
                'nav.themeSettings': 'Configurações de tema',
                'nav.preferences': 'Preferências',
                'nav.about': 'Sobre',
                'nav.formatIndustrial': 'Padrão industrial',
                'nav.format3DPrint': 'Impressão 3D',
                'nav.formatGeneral': 'Formato geral',
                
                // Abas
                'tab.3dView': 'Visualização 3D',
                'tab.codeEditor': 'Editor de código',
                'tab.aiGenerator': 'Gerador IA',
                
                // Módulo IA
                'ai.title': 'Descrição do modelo IA',
                'ai.placeholder': 'Descreva seu modelo 3D em linguagem natural, por exemplo: Criar um cubo com lado 100, com um buraco esférico de raio 30 no centro',
                'ai.generate': 'Gerar modelo',
                'ai.historyTitle': 'Histórico de geração IA',
                'ai.refresh': 'Atualizar',
                'ai.loadModel': 'Carregar modelo',
                'ai.edit': 'Editar descrição',
                'ai.delete': 'Excluir registro',
                'ai.noHistory': 'Sem histórico de geração',
                'ai.noHistoryDesc': 'Após usar a função de geração IA, o histórico será exibido aqui',
                'ai.loading': 'Carregando...',
                'ai.loadFailed': 'Falha ao carregar',
                'ai.pleaseLogin': 'Por favor, faça login',
                'ai.loginDesc': 'Após o login, você poderá ver o histórico de geração IA',
                'ai.loginNow': 'Fazer login agora',
                
                // Autenticação
                'auth.login': 'Entrar',
                'auth.signup': 'Cadastrar',
                'auth.loginTitle': 'Entrar na conta',
                'auth.signupTitle': 'Criar conta',
                'auth.email': 'E-mail',
                'auth.password': 'Senha',
                'auth.confirmPassword': 'Confirmar senha',
                'auth.emailPlaceholder': 'Digite o endereço de e-mail',
                'auth.passwordPlaceholder': 'Digite a senha',
                'auth.passwordMinPlaceholder': 'Pelo menos 6 caracteres',
                'auth.confirmPasswordPlaceholder': 'Digite a senha novamente',
                
                // Centro do usuário
                'user.center': 'Centro do usuário',
                'user.info': 'Informações pessoais',
                'user.credits': 'Meus créditos',
                'user.history': 'Histórico de geração',
                'user.emailLabel': 'E-mail',
                'user.registeredAt': 'Data de registro',
                'user.availableCredits': 'Créditos disponíveis',
                'user.recharge': 'Recarregar créditos',
                'user.logout': 'Sair',
                
                // Mensagens
                'msg.confirmNewProject': 'Deseja criar um novo projeto? As alterações não salvas serão perdidas.',
                'msg.confirmResetLayout': 'Deseja restaurar o layout padrão? As configurações atuais do layout serão redefinidas.',
                'msg.confirmDelete': 'Tem certeza de que deseja excluir este registro? Esta ação não pode ser desfeita.',
                'msg.saved': 'Salvo',
                'msg.generating': 'Gerando...',
                'msg.welcome': 'Bem-vindo ao AI 3D Studio!',
                'msg.loadingKernel': 'Carregando kernel CAD...',
                
                // Diversos
                'common.close': 'Fechar',
                'common.cancel': 'Cancelar',
                'common.confirm': 'Confirmar',
                'common.save': 'Salvar',
                'common.delete': 'Excluir',
                'common.edit': 'Editar',
                'common.loading': 'Carregando',
                'common.error': 'Erro',
                'common.success': 'Sucesso'
            },
            'vi': {
                // Điều hướng
                'nav.file': 'Tệp',
                'nav.export': 'Xuất',
                'nav.import': 'Nhập',
                'nav.settings': 'Cài đặt',
                'nav.newProject': 'Dự án mới',
                'nav.openFile': 'Mở tệp',
                'nav.saveProject': 'Lưu dự án',
                'nav.saveAs': 'Lưu thành',
                'nav.exportSTEP': 'STEP (.step)',
                'nav.exportSTL': 'STL (.stl)',
                'nav.exportOBJ': 'OBJ (.obj)',
                'nav.importSTEP': 'STEP/IGES (.step, .igs)',
                'nav.importSTL': 'STL (.stl)',
                'nav.clearImports': 'Xóa tất cả nhập',
                'nav.resetLayout': 'Đặt lại bố cục',
                'nav.themeSettings': 'Cài đặt chủ đề',
                'nav.preferences': 'Tùy chọn',
                'nav.about': 'Giới thiệu',
                'nav.formatIndustrial': 'Tiêu chuẩn công nghiệp',
                'nav.format3DPrint': 'In 3D',
                'nav.formatGeneral': 'Định dạng chung',
                
                // Tab
                'tab.3dView': 'Chế độ xem 3D',
                'tab.codeEditor': 'Trình soạn thảo mã',
                'tab.aiGenerator': 'Trình tạo AI',
                
                // Mô-đun AI
                'ai.title': 'Mô tả mô hình AI',
                'ai.placeholder': 'Mô tả mô hình 3D của bạn bằng ngôn ngữ tự nhiên, ví dụ: Tạo một khối lập phương có cạnh 100, với một lỗ hình cầu bán kính 30 ở trung tâm',
                'ai.generate': 'Tạo mô hình',
                'ai.historyTitle': 'Lịch sử tạo AI',
                'ai.refresh': 'Làm mới',
                'ai.loadModel': 'Tải mô hình',
                'ai.edit': 'Chỉnh sửa mô tả',
                'ai.delete': 'Xóa bản ghi',
                'ai.noHistory': 'Không có lịch sử tạo',
                'ai.noHistoryDesc': 'Sau khi sử dụng chức năng tạo AI, lịch sử sẽ hiển thị ở đây',
                'ai.loading': 'Đang tải...',
                'ai.loadFailed': 'Tải thất bại',
                'ai.pleaseLogin': 'Vui lòng đăng nhập',
                'ai.loginDesc': 'Sau khi đăng nhập, bạn có thể xem lịch sử tạo AI',
                'ai.loginNow': 'Đăng nhập ngay',
                
                // Xác thực
                'auth.login': 'Đăng nhập',
                'auth.signup': 'Đăng ký',
                'auth.loginTitle': 'Đăng nhập tài khoản',
                'auth.signupTitle': 'Tạo tài khoản',
                'auth.email': 'Email',
                'auth.password': 'Mật khẩu',
                'auth.confirmPassword': 'Xác nhận mật khẩu',
                'auth.emailPlaceholder': 'Nhập địa chỉ email',
                'auth.passwordPlaceholder': 'Nhập mật khẩu',
                'auth.passwordMinPlaceholder': 'Ít nhất 6 ký tự',
                'auth.confirmPasswordPlaceholder': 'Nhập lại mật khẩu',
                
                // Trung tâm người dùng
                'user.center': 'Trung tâm người dùng',
                'user.info': 'Thông tin cá nhân',
                'user.credits': 'Tín dụng của tôi',
                'user.history': 'Lịch sử tạo',
                'user.emailLabel': 'Email',
                'user.registeredAt': 'Ngày đăng ký',
                'user.availableCredits': 'Tín dụng khả dụng',
                'user.recharge': 'Nạp tín dụng',
                'user.logout': 'Đăng xuất',
                
                // Thông báo
                'msg.confirmNewProject': 'Bạn có muốn tạo dự án mới không? Các thay đổi chưa lưu sẽ bị mất.',
                'msg.confirmResetLayout': 'Bạn có muốn khôi phục bố cục mặc định không? Cài đặt bố cục hiện tại sẽ được đặt lại.',
                'msg.confirmDelete': 'Bạn có chắc chắn muốn xóa bản ghi này không? Hành động này không thể hoàn tác.',
                'msg.saved': 'Đã lưu',
                'msg.generating': 'Đang tạo...',
                'msg.welcome': 'Chào mừng đến với AI 3D Studio!',
                'msg.loadingKernel': 'Đang tải nhân CAD...',
                
                // Khác
                'common.close': 'Đóng',
                'common.cancel': 'Hủy',
                'common.confirm': 'Xác nhận',
                'common.save': 'Lưu',
                'common.delete': 'Xóa',
                'common.edit': 'Chỉnh sửa',
                'common.loading': 'Đang tải',
                'common.error': 'Lỗi',
                'common.success': 'Thành công'
            },
            'ar': {
                // التنقل
                'nav.file': 'ملف',
                'nav.export': 'تصدير',
                'nav.import': 'استيراد',
                'nav.settings': 'الإعدادات',
                'nav.newProject': 'مشروع جديد',
                'nav.openFile': 'فتح ملف',
                'nav.saveProject': 'حفظ المشروع',
                'nav.saveAs': 'حفظ باسم',
                'nav.exportSTEP': 'STEP (.step)',
                'nav.exportSTL': 'STL (.stl)',
                'nav.exportOBJ': 'OBJ (.obj)',
                'nav.importSTEP': 'STEP/IGES (.step, .igs)',
                'nav.importSTL': 'STL (.stl)',
                'nav.clearImports': 'مسح جميع الواردات',
                'nav.resetLayout': 'إعادة تعيين التخطيط',
                'nav.themeSettings': 'إعدادات المظهر',
                'nav.preferences': 'التفضيلات',
                'nav.about': 'حول',
                'nav.formatIndustrial': 'معيار صناعي',
                'nav.format3DPrint': 'طباعة ثلاثية الأبعاد',
                'nav.formatGeneral': 'تنسيق عام',
                
                // علامات التبويب
                'tab.3dView': 'عرض ثلاثي الأبعاد',
                'tab.codeEditor': 'محرر الأكواد',
                'tab.aiGenerator': 'مولد الذكاء الاصطناعي',
                
                // وحدة الذكاء الاصطناعي
                'ai.title': 'وصف نموذج الذكاء الاصطناعي',
                'ai.placeholder': 'صف نموذجك ثلاثي الأبعاد بلغة طبيعية، على سبيل المثال: إنشاء مكعب بطول ضلع 100، مع ثقب كروي نصف قطره 30 في المركز',
                'ai.generate': 'إنشاء نموذج',
                'ai.historyTitle': 'سجل إنشاء الذكاء الاصطناعي',
                'ai.refresh': 'تحديث',
                'ai.loadModel': 'تحميل النموذج',
                'ai.edit': 'تحرير الوصف',
                'ai.delete': 'حذف السجل',
                'ai.noHistory': 'لا يوجد سجل إنشاء',
                'ai.noHistoryDesc': 'بعد استخدام وظيفة إنشاء الذكاء الاصطناعي، سيظهر السجل هنا',
                'ai.loading': 'جاري التحميل...',
                'ai.loadFailed': 'فشل التحميل',
                'ai.pleaseLogin': 'الرجاء تسجيل الدخول',
                'ai.loginDesc': 'بعد تسجيل الدخول، يمكنك عرض سجل إنشاء الذكاء الاصطناعي',
                'ai.loginNow': 'تسجيل الدخول الآن',
                
                // المصادقة
                'auth.login': 'تسجيل الدخول',
                'auth.signup': 'التسجيل',
                'auth.loginTitle': 'تسجيل الدخول إلى الحساب',
                'auth.signupTitle': 'إنشاء حساب',
                'auth.email': 'البريد الإلكتروني',
                'auth.password': 'كلمة المرور',
                'auth.confirmPassword': 'تأكيد كلمة المرور',
                'auth.emailPlaceholder': 'أدخل عنوان البريد الإلكتروني',
                'auth.passwordPlaceholder': 'أدخل كلمة المرور',
                'auth.passwordMinPlaceholder': '6 أحرف على الأقل',
                'auth.confirmPasswordPlaceholder': 'أدخل كلمة المرور مرة أخرى',
                
                // مركز المستخدم
                'user.center': 'مركز المستخدم',
                'user.info': 'المعلومات الشخصية',
                'user.credits': 'رصيدي',
                'user.history': 'سجل الإنشاء',
                'user.emailLabel': 'البريد الإلكتروني',
                'user.registeredAt': 'تاريخ التسجيل',
                'user.availableCredits': 'الرصيد المتاح',
                'user.recharge': 'إعادة شحن الرصيد',
                'user.logout': 'تسجيل الخروج',
                
                // الرسائل
                'msg.confirmNewProject': 'هل تريد إنشاء مشروع جديد؟ ستفقد التغييرات غير المحفوظة.',
                'msg.confirmResetLayout': 'هل تريد استعادة التخطيط الافتراضي؟ سيتم إعادة تعيين إعدادات التخطيط الحالية.',
                'msg.confirmDelete': 'هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.',
                'msg.saved': 'تم الحفظ',
                'msg.generating': 'جاري الإنشاء...',
                'msg.welcome': 'مرحبًا بك في AI 3D Studio!',
                'msg.loadingKernel': 'جاري تحميل نواة CAD...',
                
                // متنوع
                'common.close': 'إغلاق',
                'common.cancel': 'إلغاء',
                'common.confirm': 'تأكيد',
                'common.save': 'حفظ',
                'common.delete': 'حذف',
                'common.edit': 'تحرير',
                'common.loading': 'جاري التحميل',
                'common.error': 'خطأ',
                'common.success': 'نجاح'
            }
        };
    }

    // 初始化
    init() {
        this.updatePageLanguage();
        this.createLanguageSelector();
    }

    // 获取翻译文本
    t(key) {
        const lang = this.translations[this.currentLang];
        return lang && lang[key] ? lang[key] : key;
    }

    // 切换语言
    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('ai3d_language', lang);
        this.updatePageLanguage();
    }

    // 更新页面语言
    updatePageLanguage() {
        // 更新所有带有 data-i18n 属性的元素
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });

        // 更新所有带有 data-i18n-placeholder 属性的元素
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });

        // 更新 HTML lang 属性
        document.documentElement.lang = this.currentLang;
    }

    // 创建语言选择器
    createLanguageSelector() {
        const languages = {
            'en': 'English',
            'zh-CN': '简体中文',
            'zh-TW': '繁體中文',
            'ja': '日本語',
            'ko': '한국어',
            'de': 'Deutsch',
            'fr': 'Français',
            'es': 'Español',
            'it': 'Italiano',
            'pt': 'Português',
            'vi': 'Tiếng Việt',
            'ar': 'العربية'
        };

        // 在设置菜单中添加语言选择器
        const settingsDropdown = document.querySelector('.menu-dropdown:last-child .dropdown-content');
        if (settingsDropdown) {
            const langSelector = document.createElement('div');
            langSelector.className = 'language-selector-dropdown';
            langSelector.innerHTML = `
                <a href="#" class="language-selector-trigger">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="2" y1="12" x2="22" y2="12"/>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    <span data-i18n="nav.language">语言</span>
                    <span class="current-lang">${languages[this.currentLang]}</span>
                </a>
                <div class="language-options">
                    ${Object.entries(languages).map(([code, name]) => `
                        <a href="#" data-lang="${code}" class="lang-option ${code === this.currentLang ? 'active' : ''}">
                            ${name}
                            ${code === this.currentLang ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                        </a>
                    `).join('')}
                </div>
            `;

            // 插入到"关于"之前
            const aboutLink = Array.from(settingsDropdown.children).find(el => 
                el.textContent && el.textContent.includes('关于')
            );
            if (aboutLink) {
                settingsDropdown.insertBefore(langSelector, aboutLink.previousElementSibling);
            } else {
                settingsDropdown.appendChild(langSelector);
            }

            // 绑定事件
            langSelector.querySelectorAll('.lang-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    e.preventDefault();
                    const lang = option.getAttribute('data-lang');
                    this.setLanguage(lang);
                    
                    // 更新选中状态
                    langSelector.querySelectorAll('.lang-option').forEach(opt => {
                        opt.classList.remove('active');
                        const checkmark = opt.querySelector('svg');
                        if (checkmark) checkmark.remove();
                    });
                    option.classList.add('active');
                    option.innerHTML += '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
                    
                    // 更新当前语言显示
                    langSelector.querySelector('.current-lang').textContent = languages[lang];
                });
            });
        }
    }

    // 获取支持的语言列表
    getSupportedLanguages() {
        return Object.keys(this.translations);
    }

    // 获取当前语言
    getCurrentLanguage() {
        return this.currentLang;
    }
}

// 创建全局实例
window.i18n = new I18n();
