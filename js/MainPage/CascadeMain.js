// This script governs the layout and intialization of all of the sub-windows
// If you're looking for the internals of the CAD System, they're in /js/CADWorker
// If you're looking for the 3D Three.js Viewport, they're in /js/MainPage/CascadeView*

var myLayout, monacoEditor, threejsViewport,
    consoleContainer, consoleGolden, codeContainer, gui,
    GUIState, guiSeparatorAdded = false, userGui = false, count = 0, //focused = true,
    messageHandlers = {},
    startup, file = {}, realConsoleLog, messageQueue = [], alternatingColor = true;
window.workerWorking = false;

let starterCode = 
`// Define car design variables
let car_length      = 50;
let car_width       = 20;
let overhang_front  = 8;
let overhang_rear   = 9;
let cabin_width     = 16;
let cabin_length    = 25; // 33 = station, 25=sedan, 15=pickup
let car_height      = 14;
let bonnet_height   = 8;
let bonnet_rounding = 4;
let bonnet_length   = 15;
let wheel_radius    = 5;
let tire_width      = 3;
let tire_protrude   = 1;
let rim_height      = 1;
let tire_compression= 1;
let road_clearance  = 3; 

// Derived properties
let wheel_base      = car_length - overhang_front - overhang_rear;
let cabin_narrowing = (car_width - cabin_width)/2;
let cabin_base      = road_clearance + bonnet_height
let cabin_height    = car_height-bonnet_height

// Draw car body and passenger cabin
let car_body        = Translate([0,0,road_clearance],Box(car_length,car_width,bonnet_height))
let car_cabin       = Translate([bonnet_length,cabin_narrowing,cabin_base-0.5],
                            Box(cabin_length, cabin_width, cabin_height))

// Sculpt the car body more aerodynamically
let car_body_rounded = FilletEdges(car_body,bonnet_rounding,[1,5])
let cabin_aero       = ChamferEdges(car_cabin, cabin_height-0.5 , [1,5])

// Round all edges
let cabin_rounded   = Offset(cabin_aero,1.5);
let car_shrunk = Offset(car_body_rounded,-1);
let car_rounded = Offset(car_shrunk,2); 

// Define wheels and wheel wells (Front/Rear - Left/Right)
let rim              = Rotate([1,0,0],-90, Translate(
                        [overhang_front,
                                   -(wheel_radius-tire_compression),
                                  -(tire_width - tire_protrude)]
                                  , Cylinder(wheel_radius-rim_height,tire_width,true)))
let wheel            = Rotate([1,0,0],-90, Translate( [overhang_front,
                                   -(wheel_radius-tire_compression),
                                  (0.5*tire_protrude)], 
                                  Cylinder(wheel_radius,tire_width,true)));
let wheel_FL         = Difference(wheel,[rim]);
let wheel_well_FL    = Offset(wheel,0.8,0.01,true)
let wheel_RL         = Translate([wheel_base,0,0], wheel_FL, true)
let wheel_well_RL    = Translate([wheel_base,0,0], wheel_well_FL, true)
let wheel_FR         = Rotate([0,0,1],180,Translate([-(2*overhang_front),-car_width ,0], wheel_FL, true))
let wheel_well_FR    = Translate([0,car_width-1,0], wheel_well_FL, true)
let wheel_RR         = Translate([wheel_base,0,0], wheel_FR, true)
let wheel_well_RR    = Translate([wheel_base,0,0], wheel_well_FR, true)

// Subtract the wheel wells from the car-body
Difference(car_rounded,[wheel_well_FL, 
                        wheel_well_RL, 
                        wheel_well_FR, 
                        wheel_well_RR])`;

function initialize(projectContent = null) {
    this.searchParams = new URLSearchParams(window.location.search || window.location.hash.substr(1))

    // 检测是否为移动端
    const isMobile = window.innerWidth <= 768;
    console.log('初始化 - 移动端检测:', isMobile, '窗口宽度:', window.innerWidth);

    // Load the initial Project from - "projectContent", or the URL
    let loadFromURL     = this.searchParams.has("code")
    // Set up the Windowing/Docking/Layout System  ---------------------------------------

    // Load a project from the Gallery
    if (projectContent) {
        // Destroy old config, load new one
        if(myLayout != null){
            myLayout.destroy();
            myLayout = null;
        }
        myLayout = new GoldenLayout(JSON.parse(projectContent));

    // Else load a project from the URL or create a new one from scratch
    } else {
        let codeStr = starterCode;
        GUIState = {};
        if (loadFromURL) {
            codeStr  = decode(this.searchParams.get("code"));
            GUIState = JSON.parse(decode(this.searchParams.get("gui")));
        }

        // Define the Default Golden Layout
        // 移动端：只显示3D视图和代码编辑器（隐藏AI模块，AI输入框移到底部）
        // 桌面端：AI模块在最左侧栏（包含控制台输出），代码编辑器和3D视图在右侧用Tab切换
        console.log('创建布局 - 移动端模式:', isMobile);
        
        if (isMobile) {
            console.log('使用移动端布局配置');
            myLayout = new GoldenLayout({
                content: [{
                    type: 'stack',
                    content: [{
                        type: 'component',
                        componentName: 'cascadeView',
                        title: '3D 视图',
                        componentState: GUIState,
                        isClosable: false
                    }, {
                        type: 'component',
                        componentName: 'codeEditor',
                        title: '代码编辑器',
                        componentState: { code: codeStr },
                        isClosable: false
                    }, {
                        type: 'component',
                        componentName: 'aiModule',
                        title: 'AI 生成器',
                        componentState: {},
                        isClosable: false
                    }]
                }],
                settings: {
                    showPopoutIcon: false,
                    showMaximiseIcon: false,
                    showCloseIcon: false
                }
            });
        } else {
            console.log('使用桌面端布局配置');
            myLayout = new GoldenLayout({
                content: [{
                    type: 'row',
                    content: [{
                        type: 'component',
                        componentName: 'aiModule',
                        title: 'AI 生成器',
                        componentState: {},
                        isClosable: false,
                        width: 25.0
                    }, {
                        type: 'stack',
                        content: [{
                            type: 'component',
                            componentName: 'cascadeView',
                            title: '3D 视图',
                            componentState: GUIState,
                            isClosable: false
                        }, {
                            type: 'component',
                            componentName: 'codeEditor',
                            title: '代码编辑器',
                            componentState: { code: codeStr },
                            isClosable: false
                        }]
                    }]
                }],
                settings: {
                    showPopoutIcon: false,
                    showMaximiseIcon: false,
                    showCloseIcon: false
                }
            });
        }

    }

    // Set up the Dockable Monaco Code Editor
    myLayout.registerComponent('codeEditor', function (container, state) {
        console.log('注册 codeEditor 组件');
        myLayout.on("initialised", () => {
            console.log('codeEditor 初始化');
            // Destroy the existing editor if it exists
            if (monacoEditor) {
                monaco.editor.getModels().forEach(model => model.dispose());
                monacoEditor = null;
            }

            // Set the Monaco Language Options
            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                allowNonTsExtensions: true,
                moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            });
            monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

            // Import Typescript Intellisense Definitions for the relevant libraries...
            var extraLibs = [];
            let prefix = window.location.href.startsWith("https://zalo.github.io/") ? "/CascadeStudio/" : "";
            // opencascade.js Typescript Definitions...
            fetch(prefix + "node_modules/opencascade.js/dist/oc.d.ts").then((response) => {
                response.text().then(function (text) {
                    extraLibs.push({ content: text, filePath: 'file://' + prefix + 'node_modules/opencascade.js/dist/oc.d.ts' });
                });
            }).catch(error => console.log(error.message));

            // Three.js Typescript definitions...
            fetch(prefix + "node_modules/three/build/three.d.ts").then((response) => {
                response.text().then(function (text) {
                    extraLibs.push({ content: text, filePath: 'file://' + prefix + 'node_modules/three/build/three.d.ts' });
                });
            }).catch(error => console.log(error.message));

            // CascadeStudio Typescript Definitions...
            fetch(prefix + "js/StandardLibraryIntellisense.ts").then((response) => {
                response.text().then(function (text) {
                    extraLibs.push({ content: text, filePath: 'file://' + prefix + 'js/StandardLibraryIntellisense.d.ts' });
                    monaco.editor.createModel("", "typescript"); //text
                    monaco.languages.typescript.typescriptDefaults.setExtraLibs(extraLibs);
                });
            }).catch(error => console.log(error.message));

            // Check for code serialization as an array
            codeContainer = container;
            if (isArrayLike(state.code)) {
                let codeString = "";
                for (let i = 0; i < state.code.length; i++) {
                    codeString += state.code[i] + "\n";
                }
                codeString = codeString.slice(0,-1);
                state.code = codeString;
                container.setState({ code: codeString });
            }

            // Initialize the Monaco Code Editor inside this dockable container
            monacoEditor = monaco.editor.create(container.getElement().get(0), {
                value: state.code,
                language: "typescript",
                theme: "vs-dark",
                automaticLayout: true,
                minimap: { enabled: false }//,
                //model: null
            });
            console.log('monacoEditor 创建完成:', monacoEditor);

            // Collapse all Functions in the Editor to suppress library clutter -----------------
            let codeLines = state.code.split(/\r\n|\r|\n/);
            let collapsed = []; let curCollapse = null;
            for (let li = 0; li < codeLines.length; li++) {
                if (codeLines[li].startsWith("function")) {
                    curCollapse = { "startLineNumber": (li + 1) };
                } else if (codeLines[li].startsWith("}") && curCollapse !== null) {
                    curCollapse["endLineNumber"] = (li + 1);
                    collapsed.push(curCollapse);
                    curCollapse = null;
                }
            }
            let mergedViewState = Object.assign(monacoEditor.saveViewState(), {
                "contributionsState": {
                    "editor.contrib.folding": {
                        "collapsedRegions": collapsed, 
                        "lineCount": codeLines.length,
                        "provider": "indent" 
                    },
                    "editor.contrib.wordHighlighter": false 
                }
            });
            monacoEditor.restoreViewState(mergedViewState);
            // End Collapsing All Functions -----------------------------------------------------
            
            /** This function triggers the evaluation of the editor code 
             *  inside the CAD Worker thread.*/
            monacoEditor.evaluateCode = (saveToURL = false) => {
                // Don't evaluate if the `window.workerWorking` flag is true
                if (window.workerWorking) { return; }

                // Set the "window.workerWorking" flag, so we don't submit 
                // multiple jobs to the worker thread simultaneously
                window.workerWorking = true;

                // Refresh these every so often to ensure we're always getting intellisense
                monaco.languages.typescript.typescriptDefaults.setExtraLibs(extraLibs);

                // Retrieve the code from the editor window as a string
                let newCode = monacoEditor.getValue();

                // Clear Inline Monaco Editor Error Highlights
                monaco.editor.setModelMarkers(monacoEditor.getModel(), 'test', []);

                // Refresh the GUI Panel
                if (gui) {
                    gui.dispose();
                }

                gui = new Tweakpane.Pane({
                    title: 'AI 3D Control Panel',
                    container: document.getElementById('guiPanel')
                });
                guiSeparatorAdded = false;
                userGui = false;
                messageHandlers["addButton"]({ name: "Evaluate", label: "Function", callback: () => { monacoEditor.evaluateCode(true) } });
                messageHandlers["addSlider"]({ name: "MeshRes", default: 0.1, min: 0.01, max: 2, step: 0.01, dp: 2 });
                messageHandlers["addCheckbox"]({ name: "Cache?", default: true });
                messageHandlers["addCheckbox"]({ name: "GroundPlane?", default: true });
                messageHandlers["addCheckbox"]({ name: "Grid?", default: true });
                userGui = true;
                // Remove any existing Transform Handles that could be laying around
                threejsViewport.clearTransformHandles();

                // Set up receiving files from the worker thread
                // This lets users download arbitrary information 
                // from the CAD engine via the `saveFile()` function
                messageHandlers["saveFile"] = (payload) => {
                    let link = document.createElement("a");
                    link.href = payload.fileURL;
                    link.download = payload.filename;
                    link.click();
                };

                // Send the current editor code and GUI state to the Worker thread
                // This is where the magic happens!
                cascadeStudioWorker.postMessage({
                    "type": "Evaluate",
                    payload: {
                        "code": newCode,
                        "GUIState": GUIState
                    }
                });

                // After evaluating, assemble all of the objects in the "workspace" 
                // and begin saving them out
                cascadeStudioWorker.postMessage({
                    "type": "combineAndRenderShapes",
                // TODO: GUIState[] may be referenced upon transfer and not copied (checkboxes are false after reload although the default is true
                    payload: { maxDeviation: GUIState["MeshRes"], sceneOptions: { groundPlaneVisible: GUIState["GroundPlane?"], gridVisible: GUIState["Grid?"] } }
                });

                // Saves the current code to the project
                container.setState({ code: newCode });

                // Determine whether to save the code + gui (no external files) 
                // to the URL depending on the current mode of the editor.
                if (saveToURL) {
                    console.log("Saved to URL!"); //Generation Complete! 
                    window.history.replaceState({}, 'AI 3D Studio',
                      new URL(location.pathname + "#code=" + encode(newCode) + "&gui=" + encode(JSON.stringify(GUIState)), location.href).href
                    );
                }

                // Print a friendly message (to which we'll append progress updates)
                console.log("Generating Model");
            };

            document.onkeydown = function (e) {
                // Force the F5 Key to refresh the model instead of refreshing the page
                if ((e.which || e.keyCode) == 116) {
                    e.preventDefault();
                    monacoEditor.evaluateCode(true);
                    return false;
                }
                // Save the project on Ctrl+S
                if (String.fromCharCode(e.keyCode).toLowerCase() === 's' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    saveProject();
                    monacoEditor.evaluateCode(true);
                }
                return true;
            };

            document.onkeyup = function (e) {
                if (!file.handle || e.which === 0) {
                    return true;
                }
                if (file.content == monacoEditor.getValue()) {
                    codeContainer.setTitle(file.handle.name);
                } else {
                    codeContainer.setTitle('* ' + file.handle.name);
                }
                return true;
            };
        });
    });

    // Set up the Dockable Three.js 3D Viewport for viewing the CAD Model
    myLayout.registerComponent('cascadeView', function (container, state) {
        console.log('注册 cascadeView 组件');
        GUIState = state;
        container.setState(GUIState);
        myLayout.on("initialised", () => {
            console.log('cascadeView 初始化');
            // Destroy the existing editor if it exists
            if (threejsViewport) {
                threejsViewport.active = false;
                threejsViewport = null;
            }

            let floatingGUIContainer = document.createElement("div");
            floatingGUIContainer.className = 'gui-panel';
            floatingGUIContainer.id = "guiPanel";
            container.getElement().get(0).appendChild(floatingGUIContainer);
            threejsViewport = new CascadeEnvironment(container);
            console.log('threejsViewport 创建完成:', threejsViewport);
            
            // 监听容器显示事件
            container.on('show', function() {
                console.log('3D视图显示，刷新渲染器');
                if (threejsViewport && threejsViewport.renderer) {
                    const containerEl = container.getElement().get(0);
                    const width = containerEl.offsetWidth;
                    const height = containerEl.offsetHeight;
                    console.log('刷新Canvas尺寸:', width, 'x', height);
                    threejsViewport.renderer.setSize(width, height);
                    if (threejsViewport.camera) {
                        threejsViewport.camera.aspect = width / height;
                        threejsViewport.camera.updateProjectionMatrix();
                    }
                    threejsViewport.renderer.render(threejsViewport.scene, threejsViewport.camera);
                }
            });
        });
    });

    // Set up the AI Module Component (with generation history)
    myLayout.registerComponent('aiModule', function (container) {
        consoleGolden = container;
        
        // 检测是否为移动端
        const isMobile = window.innerWidth <= 768;
        
        // 移动端：隐藏AI模块的Tab
        if (isMobile) {
            setTimeout(() => {
                const aiTab = container.tab;
                if (aiTab && aiTab.element) {
                    aiTab.element.hide();
                }
            }, 100);
        }
        
        let aiModuleContainer = document.createElement("div");
        aiModuleContainer.className = "ai-module-container";
        aiModuleContainer.innerHTML = `
            <div class="ai-module-content">
                <div class="generation-history-panel">
                    <div class="history-header">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                        </svg>
                        <span>AI 生成历史</span>
                        <button class="btn-refresh-history" onclick="window.refreshGenerationHistory()" title="刷新">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                                <path d="M21 3v5h-5"/>
                            </svg>
                        </button>
                    </div>
                    <div id="generationHistoryContent" class="history-content"></div>
                </div>
                
                <div class="ai-input-wrapper" id="aiInputWrapper">
                    <div class="ai-section-title">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                            <path d="M2 17l10 5 10-5"/>
                            <path d="M2 12l10 5 10-5"/>
                        </svg>
                        AI 模型描述
                    </div>
                    <textarea id="aiPromptInputModule" class="ai-prompt-textarea" placeholder="用自然语言描述你想要的 3D 模型，例如：创建一个边长100的立方体，中间挖一个半径30的球形孔"></textarea>
                    <button id="aiGenerateBtnModule" class="ai-generate-btn-module">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        生成模型
                    </button>
                </div>
            </div>
        `;
        container.getElement().get(0).appendChild(aiModuleContainer);
        container.getElement().get(0).style.overflow = 'hidden';
        
        // 如果是移动端，将AI输入框移到body底部
        if (isMobile) {
            setTimeout(() => {
                const aiInputWrapper = document.getElementById('aiInputWrapper');
                if (aiInputWrapper) {
                    document.body.appendChild(aiInputWrapper);
                }
            }, 100);
        }
        
        // 加载生成历史记录
        window.refreshGenerationHistory = async function() {
            if (!authManager || !authManager.currentUser) {
                const historyContent = document.getElementById('generationHistoryContent');
                if (historyContent) {
                    historyContent.innerHTML = `
                        <div class="empty-state">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            <p>请先登录</p>
                            <span>登录后可查看AI生成历史记录</span>
                            <button class="btn-login-prompt" onclick="authManager.showAuthModal()">立即登录</button>
                        </div>
                    `;
                }
                return;
            }

            const historyContent = document.getElementById('generationHistoryContent');
            if (!historyContent) return;

            // 显示加载状态
            historyContent.innerHTML = `
                <div class="loading-state">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="loading-spinner">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                    </svg>
                    <p>加载中...</p>
                </div>
            `;

            try {
                const { data, error } = await authManager.supabase
                    .from('ai_generations')
                    .select('*')
                    .eq('user_id', authManager.currentUser.id)
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (error) {
                    console.error('加载生成记录失败:', error);
                    historyContent.innerHTML = `
                        <div class="empty-state">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <p>加载失败</p>
                            <span>${error.message}</span>
                        </div>
                    `;
                    return;
                }

                if (!data || data.length === 0) {
                    historyContent.innerHTML = `
                        <div class="empty-state">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                            </svg>
                            <p>暂无生成记录</p>
                            <span>开始使用AI生成功能后，历史记录将显示在这里</span>
                        </div>
                    `;
                } else {
                    historyContent.innerHTML = data.map(record => {
                        const hasCode = record.generated_code && record.generated_code.trim().length > 0;
                        const codePreview = hasCode ? record.generated_code.substring(0, 80) + (record.generated_code.length > 80 ? '...' : '') : '';
                        
                        return `
                        <div class="history-item" data-record-id="${record.id}">
                            <div class="history-item-header">
                                <span class="history-date">${new Date(record.created_at).toLocaleString('zh-CN', {
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</span>
                                <span class="history-credits">-${record.credits_consumed.toFixed(2)}</span>
                            </div>
                            <div class="history-description">${escapeHtml(record.description || 'AI生成任务')}</div>
                            ${hasCode ? `
                            <div class="history-actions">
                                <button class="btn-load-history-code" onclick="loadHistoryCode('${record.id}')" title="加载到编辑器">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="16 18 22 12 16 6"/>
                                        <polyline points="8 6 2 12 8 18"/>
                                    </svg>
                                    加载代码
                                </button>
                            </div>
                            ` : ''}
                        </div>
                    `}).join('');
                }
            } catch (err) {
                console.error('加载生成记录异常:', err);
                historyContent.innerHTML = `
                    <div class="empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <p>加载失败</p>
                        <span>${err.message}</span>
                    </div>
                `;
            }
        };

        // HTML转义函数
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // 加载历史代码到编辑器
        window.loadHistoryCode = async function(recordId) {
            if (!authManager || !authManager.currentUser) {
                alert('请先登录');
                return;
            }

            try {
                const { data, error } = await authManager.supabase
                    .from('ai_generations')
                    .select('generated_code, description')
                    .eq('id', recordId)
                    .eq('user_id', authManager.currentUser.id)
                    .single();

                if (error) {
                    console.error('加载代码失败:', error);
                    alert('加载代码失败: ' + error.message);
                    return;
                }

                if (data && data.generated_code) {
                    if (window.monacoEditor) {
                        window.monacoEditor.setValue(data.generated_code);
                        console.log('代码已加载到编辑器:', data.description);
                        
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
        };

        // 初始加载历史记录
        setTimeout(() => {
            window.refreshGenerationHistory();
        }, 500);
        
        // This should allow objects with circular references to print to the text console
        let getCircularReplacer = () => {
            let seen = new WeakSet();
            return (key, value) => {
                if (typeof value === "object" && value !== null) {
                    if (seen.has(value)) { return; }
                    seen.add(value);
                }
                return value;
            };
        };

        // 保留控制台日志功能（输出到浏览器控制台）
        if (!realConsoleLog) {
            realConsoleLog = console.log;
            
            console.log = function (message) {
                realConsoleLog.apply(console, arguments);
                // 不再输出到页面上的控制台，只输出到浏览器控制台
            };
            
            // Call this console.log when triggered from the WASM
            messageHandlers["log"  ] = (payload) => { console.log(payload); };
            messageHandlers["error"] = (payload) => { window.workerWorking = false; console.error(payload); };

            // Print Errors in Red (只输出到浏览器控制台)
            window.onerror = function (err, url, line, colno, errorObj) {
                realConsoleLog.call(console, "Error:", err);

                // Highlight the error'd code in the editor
                if (!errorObj || !(errorObj.stack.includes("wasm-function"))) {
                    if (monacoEditor && monacoEditor.getModel()) {
                        monaco.editor.setModelMarkers(monacoEditor.getModel(), 'test', [{
                            startLineNumber: line,
                            startColumn: colno,
                            endLineNumber: line,
                            endColumn: 1000,
                            message: JSON.stringify(err, getCircularReplacer()),
                            severity: monaco.MarkerSeverity.Error
                        }]);
                    }
                }
            };

            // If we've received a progress update from the Worker Thread, log it
            messageHandlers["Progress"] = (payload) => {
                console.log("Generating Model" + ".".repeat(payload.opNumber) + ((payload.opType)? " ("+payload.opType+")" : ""));
            };

            // Print friendly welcoming messages
            console.log("Welcome to AI 3D Studio!");
            console.log("Loading CAD Kernel...");
        }
        
        // 绑定AI生成按钮事件
        setTimeout(() => {
            const aiBtn = document.getElementById('aiGenerateBtnModule');
            const aiInput = document.getElementById('aiPromptInputModule');
            
            if (aiBtn && aiInput) {
                aiBtn.onclick = () => {
                    const prompt = aiInput.value.trim();
                    if (prompt && window.aiGenerator) {
                        window.aiGenerator.generateFromPrompt(prompt);
                    }
                };
                
                // 支持Ctrl+Enter快捷键
                aiInput.onkeydown = (e) => {
                    if (e.ctrlKey && e.key === 'Enter') {
                        e.preventDefault();
                        aiBtn.click();
                    }
                };
                
                // 移动端：处理输入法弹出时的页面滚动问题
                if (window.innerWidth <= 768) {
                    let originalHeight = window.innerHeight;
                    
                    aiInput.addEventListener('focus', function() {
                        console.log('AI输入框获得焦点');
                        // 延迟执行，等待输入法弹出
                        setTimeout(() => {
                            // 滚动到输入框位置
                            this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 300);
                    });
                    
                    aiInput.addEventListener('blur', function() {
                        console.log('AI输入框失去焦点');
                        // 恢复页面位置
                        window.scrollTo(0, 0);
                    });
                    
                    // 监听窗口大小变化（输入法弹出会改变窗口高度）
                    window.addEventListener('resize', function() {
                        const currentHeight = window.innerHeight;
                        if (currentHeight < originalHeight) {
                            // 输入法弹出
                            console.log('输入法弹出，高度变化:', originalHeight, '->', currentHeight);
                        } else {
                            // 输入法收起
                            originalHeight = currentHeight;
                        }
                    });
                }
            }
        }, 100);
    });

    // Set up the Error and Status Reporting (now integrated in AI Module)
    myLayout.registerComponent('console', function (container) {
        // This component is deprecated but kept for compatibility
        // Console output is now integrated into the AI Module
    });

    // onbeforeunload doesn't get triggered in time to do any good
    //window.onbeforeunload = function () {}
    //window.onblur  = () => { focused = false; }
    //window.onfocus = () => { focused = true; }
    //document.onblur = window.onblur; document.onfocus = window.onfocus;

    // Resize the layout when the browser resizes
    window.onorientationchange = function (event) {
        const isMobile = window.innerWidth <= 768;
        const topnavHeight = document.getElementsByClassName('topnav')[0].offsetHeight;
        const aiInputHeight = isMobile ? (document.getElementById('aiInputWrapper')?.offsetHeight || 140) : 0;
        const layoutHeight = window.innerHeight - topnavHeight - aiInputHeight;
        
        myLayout.updateSize(window.innerWidth, layoutHeight);
        
        // 更新Monaco编辑器
        if (monacoEditor) {
            monacoEditor.layout();
        }
        
        // 更新Three.js渲染器
        if (threejsViewport && threejsViewport.renderer) {
            const container = threejsViewport.container.getElement().get(0);
            threejsViewport.renderer.setSize(container.offsetWidth, container.offsetHeight);
            if (threejsViewport.camera) {
                threejsViewport.camera.aspect = container.offsetWidth / container.offsetHeight;
                threejsViewport.camera.updateProjectionMatrix();
            }
        }
    };
    
    // 监听窗口大小变化，处理移动端AI输入框位置
    window.addEventListener('resize', function() {
        const isMobile = window.innerWidth <= 768;
        const aiInputWrapper = document.getElementById('aiInputWrapper');
        
        if (aiInputWrapper) {
            if (isMobile) {
                // 移动端：将AI输入框移到body底部
                if (aiInputWrapper.parentElement.tagName !== 'BODY') {
                    document.body.appendChild(aiInputWrapper);
                }
            } else {
                // 桌面端：确保AI输入框在原位置
                const aiModuleContent = document.querySelector('.ai-module-content');
                if (aiModuleContent && !aiModuleContent.contains(aiInputWrapper)) {
                    aiModuleContent.appendChild(aiInputWrapper);
                }
            }
        }
        
        const topnavHeight = document.getElementById('topnav').offsetHeight;
        const aiInputHeight = isMobile ? (aiInputWrapper?.offsetHeight || 140) : 0;
        const layoutHeight = window.innerHeight - topnavHeight - aiInputHeight;
        
        myLayout.updateSize(window.innerWidth, layoutHeight);
        
        // 更新Monaco编辑器
        if (monacoEditor) {
            monacoEditor.layout();
        }
        
        // 更新Three.js渲染器
        if (threejsViewport && threejsViewport.renderer) {
            const container = threejsViewport.container.getElement().get(0);
            threejsViewport.renderer.setSize(container.offsetWidth, container.offsetHeight);
            if (threejsViewport.camera) {
                threejsViewport.camera.aspect = container.offsetWidth / container.offsetHeight;
                threejsViewport.camera.updateProjectionMatrix();
            }
        }
    });

    // Initialize the Layout
    myLayout.init();
    
    // 移动端需要延迟计算布局尺寸，确保DOM完全渲染
    if (isMobile) {
        setTimeout(() => {
            const topnavHeight = document.getElementById('topnav').offsetHeight;
            const aiInputHeight = 140;
            const layoutHeight = window.innerHeight - topnavHeight - aiInputHeight;
            
            console.log('初始化布局尺寸:', window.innerWidth, 'x', layoutHeight);
            myLayout.updateSize(window.innerWidth, layoutHeight);
            
            // 强制刷新布局
            if (monacoEditor) {
                monacoEditor.layout();
            }
            if (threejsViewport && threejsViewport.renderer) {
                const container = threejsViewport.container.getElement().get(0);
                threejsViewport.renderer.setSize(container.offsetWidth, container.offsetHeight);
                if (threejsViewport.camera) {
                    threejsViewport.camera.aspect = container.offsetWidth / container.offsetHeight;
                    threejsViewport.camera.updateProjectionMatrix();
                }
            }
        }, 100);
    } else {
        const topnavHeight = document.getElementById('topnav').offsetHeight;
        const layoutHeight = window.innerHeight - topnavHeight;
        
        console.log('初始化布局尺寸:', window.innerWidth, 'x', layoutHeight);
        myLayout.updateSize(window.innerWidth, layoutHeight);
    }
    
    // 移动端调试：确保布局正确显示
    if (isMobile) {
        console.log('移动端模式已启用');
        console.log('窗口宽度:', window.innerWidth);
        console.log('布局高度:', window.innerHeight - document.getElementById('topnav').offsetHeight);
        
        // 延迟执行，确保DOM完全加载
        setTimeout(() => {
            const cascadeView = document.querySelector('[title="3D 视图"]');
            const codeEditor = document.querySelector('[title="代码编辑器"]');
            const aiModule = document.querySelector('[title="AI 生成器"]');
            const canvas = document.querySelector('canvas');
            const monacoEditorEl = document.querySelector('.monaco-editor');
            const lmStack = document.querySelector('.lm_stack');
            const lmItems = document.querySelector('.lm_items');
            const lmHeader = document.querySelector('.lm_header');
            const lmTabs = document.querySelector('.lm_tabs');
            const allTabs = document.querySelectorAll('.lm_tab');
            
            console.log('=== DOM元素检查 ===');
            console.log('3D视图容器:', cascadeView);
            console.log('代码编辑器容器:', codeEditor);
            console.log('AI模块容器:', aiModule);
            console.log('Canvas元素:', canvas);
            console.log('Monaco编辑器元素:', monacoEditorEl);
            console.log('Stack容器:', lmStack);
            console.log('Items容器:', lmItems);
            console.log('Header容器:', lmHeader);
            console.log('Tabs容器:', lmTabs);
            console.log('所有Tab数量:', allTabs.length);
            
            allTabs.forEach((tab, index) => {
                const title = tab.querySelector('.lm_title');
                const computedStyle = window.getComputedStyle(tab);
                console.log(`Tab ${index + 1}:`, {
                    title: title?.textContent,
                    display: computedStyle.display,
                    visibility: computedStyle.visibility,
                    opacity: computedStyle.opacity,
                    width: tab.offsetWidth,
                    height: tab.offsetHeight
                });
            });
            
            if (canvas) {
                console.log('Canvas尺寸:', canvas.offsetWidth, 'x', canvas.offsetHeight);
            }
            if (monacoEditorEl) {
                console.log('Monaco编辑器尺寸:', monacoEditorEl.offsetWidth, 'x', monacoEditorEl.offsetHeight);
            }
            if (lmStack) {
                console.log('Stack尺寸:', lmStack.offsetWidth, 'x', lmStack.offsetHeight);
            }
            if (lmItems) {
                console.log('Items尺寸:', lmItems.offsetWidth, 'x', lmItems.offsetHeight);
            }
            if (lmHeader) {
                const headerStyle = window.getComputedStyle(lmHeader);
                console.log('Header样式:', {
                    display: headerStyle.display,
                    visibility: headerStyle.visibility,
                    height: lmHeader.offsetHeight,
                    width: lmHeader.offsetWidth
                });
            }
            
            // 隐藏AI模块的Tab
            const tabs = document.querySelectorAll('.lm_tab');
            tabs.forEach((tab, index) => {
                const title = tab.querySelector('.lm_title');
                if (title && title.textContent.includes('AI 生成器')) {
                    console.log('隐藏AI模块Tab (索引:', index, ')');
                    tab.style.display = 'none';
                    tab.style.visibility = 'hidden';
                }
            });
            
            // 强制修复 lm_items 容器尺寸 - 直接从窗口计算
            const appbody = document.getElementById('appbody');
            if (lmItems && appbody) {
                // 计算实际可用高度
                const topnavHeight = document.getElementById('topnav')?.offsetHeight || 48;
                const aiInputHeight = document.getElementById('aiInputWrapper')?.offsetHeight || 140;
                const appbodyHeight = window.innerHeight - topnavHeight - aiInputHeight;
                const headerHeight = 48; // 固定 header 高度
                const itemsHeight = appbodyHeight - headerHeight;
                
                console.log('修复Items容器尺寸');
                console.log('窗口高度:', window.innerHeight);
                console.log('导航栏高度:', topnavHeight);
                console.log('AI输入框高度:', aiInputHeight);
                console.log('Appbody高度:', appbodyHeight);
                console.log('Header高度:', headerHeight);
                console.log('计算Items高度:', itemsHeight);
                
                // 强制设置 appbody
                appbody.style.position = 'absolute';
                appbody.style.top = topnavHeight + 'px';
                appbody.style.left = '0';
                appbody.style.right = '0';
                appbody.style.bottom = aiInputHeight + 'px';
                appbody.style.width = '100%';
                appbody.style.height = 'auto';
                
                // 强制设置 Golden Layout 根容器 - 使用具体像素值
                const lmRoot = document.querySelector('.lm_root');
                if (lmRoot) {
                    lmRoot.style.position = 'absolute';
                    lmRoot.style.top = '0';
                    lmRoot.style.left = '0';
                    lmRoot.style.width = window.innerWidth + 'px';
                    lmRoot.style.height = appbodyHeight + 'px';
                }
                
                // 强制设置 Stack 容器 - 使用具体像素值
                if (lmStack) {
                    lmStack.style.position = 'absolute';
                    lmStack.style.top = '0';
                    lmStack.style.left = '0';
                    lmStack.style.width = window.innerWidth + 'px';
                    lmStack.style.height = appbodyHeight + 'px';
                }
                
                // 强制设置 Header
                if (lmHeader) {
                    lmHeader.style.height = headerHeight + 'px';
                    lmHeader.style.minHeight = headerHeight + 'px';
                    lmHeader.style.display = 'flex';
                }
                
                // 强制设置 Items 容器使用绝对定位
                lmItems.style.position = 'absolute';
                lmItems.style.top = headerHeight + 'px';
                lmItems.style.left = '0';
                lmItems.style.right = '0';
                lmItems.style.bottom = '0';
                lmItems.style.width = '100%';
                lmItems.style.height = itemsHeight + 'px';
                lmItems.style.overflow = 'hidden';
                
                // 强制浏览器重排（触发样式生效）
                void lmItems.offsetHeight;
                
                // 修复所有 lm_item_container
                const itemContainers = lmItems.querySelectorAll('.lm_item_container');
                itemContainers.forEach(container => {
                    container.style.width = '100%';
                    container.style.height = '100%';
                    container.style.position = 'absolute';
                    container.style.top = '0';
                    container.style.left = '0';
                    container.style.display = ''; // 移除 display:none
                });
                
                // 强制浏览器重排
                if (itemContainers.length > 0) {
                    void itemContainers[0].offsetHeight;
                }
                
                // 修复所有 lm_content 容器
                const contents = lmItems.querySelectorAll('.lm_content');
                contents.forEach(content => {
                    content.style.width = '100%';
                    content.style.height = '100%';
                    content.style.position = 'absolute';
                    content.style.top = '0';
                    content.style.left = '0';
                });
                
                // 强制浏览器重排
                if (contents.length > 0) {
                    void contents[0].offsetHeight;
                }
                
                // 显示当前激活的 item
                const activeItem = lmItems.querySelector('.lm_item_container');
                if (activeItem) {
                    activeItem.style.display = 'block';
                    activeItem.style.visibility = 'visible';
                    activeItem.style.opacity = '1';
                }
            }
            
            // 强制更新布局
            const topnavHeight = document.getElementById('topnav').offsetHeight;
            const aiInputHeight = document.getElementById('aiInputWrapper')?.offsetHeight || 140;
            const layoutHeight = window.innerHeight - topnavHeight - aiInputHeight;
            console.log('计算布局高度:', layoutHeight, '= 窗口高度', window.innerHeight, '- 导航栏', topnavHeight, '- AI输入框', aiInputHeight);
            
            myLayout.updateSize(window.innerWidth, layoutHeight);
            
            // 第一次检查尺寸（立即）
            setTimeout(() => {
                console.log('=== 第一次尺寸检查 ===');
                if (lmItems) {
                    console.log('Items容器尺寸:', lmItems.offsetWidth, 'x', lmItems.offsetHeight);
                }
                if (canvas) {
                    console.log('Canvas尺寸:', canvas.offsetWidth, 'x', canvas.offsetHeight);
                }
                if (monacoEditorEl) {
                    console.log('Monaco编辑器尺寸:', monacoEditorEl.offsetWidth, 'x', monacoEditorEl.offsetHeight);
                }
                
                // 如果尺寸还是0，再次强制设置
                if (lmItems && lmItems.offsetHeight === 0) {
                    console.log('尺寸仍为0，再次强制设置...');
                    const topnavHeight = document.getElementById('topnav')?.offsetHeight || 48;
                    const aiInputHeight = document.getElementById('aiInputWrapper')?.offsetHeight || 140;
                    const appbodyHeight = window.innerHeight - topnavHeight - aiInputHeight;
                    const headerHeight = 48;
                    const itemsHeight = appbodyHeight - headerHeight;
                    
                    lmItems.style.cssText = `
                        position: absolute !important;
                        top: ${headerHeight}px !important;
                        left: 0 !important;
                        right: 0 !important;
                        bottom: 0 !important;
                        width: 100% !important;
                        height: ${itemsHeight}px !important;
                        overflow: hidden !important;
                    `;
                    
                    // 强制所有子容器显示
                    const allContainers = lmItems.querySelectorAll('.lm_item_container, .lm_content');
                    allContainers.forEach(el => {
                        el.style.cssText = `
                            position: absolute !important;
                            top: 0 !important;
                            left: 0 !important;
                            width: 100% !important;
                            height: 100% !important;
                            display: block !important;
                            visibility: visible !important;
                        `;
                    });
                    
                    // 强制 Golden Layout 更新
                    const layoutHeight = window.innerHeight - topnavHeight - aiInputHeight;
                    myLayout.updateSize(window.innerWidth, layoutHeight);
                }
            }, 100);
            
            // 第二次检查尺寸（延迟更长时间）
            setTimeout(() => {
                console.log('=== 第二次尺寸检查 ===');
                
                // 强制 Golden Layout 重新计算尺寸
                const topnavHeight = document.getElementById('topnav')?.offsetHeight || 48;
                const aiInputHeight = document.getElementById('aiInputWrapper')?.offsetHeight || 140;
                const layoutHeight = window.innerHeight - topnavHeight - aiInputHeight;
                console.log('强制更新 Golden Layout 尺寸:', window.innerWidth, 'x', layoutHeight);
                myLayout.updateSize(window.innerWidth, layoutHeight);
                
                // Golden Layout 更新后，再次强制设置尺寸（覆盖 Golden Layout 的计算）
                setTimeout(() => {
                    const lmItems = document.querySelector('.lm_items');
                    const lmStack = document.querySelector('.lm_stack');
                    const lmRoot = document.querySelector('.lm_root');
                    const lmHeader = document.querySelector('.lm_header');
                    const appbody = document.getElementById('appbody');
                    
                    if (lmItems && lmStack && appbody) {
                        const headerHeight = 48;
                        const appbodyHeight = appbody.offsetHeight || layoutHeight;
                        const itemsHeight = appbodyHeight - headerHeight;
                        const itemsWidth = window.innerWidth;
                        
                        console.log('Golden Layout 更新后再次修复:');
                        console.log('Appbody尺寸:', appbody.offsetWidth, 'x', appbody.offsetHeight);
                        
                        // 强制设置 lm_root 具体像素值
                        if (lmRoot) {
                            lmRoot.setAttribute('style', `
                                position: absolute !important;
                                top: 0 !important;
                                left: 0 !important;
                                width: ${itemsWidth}px !important;
                                height: ${appbodyHeight}px !important;
                                display: block !important;
                                visibility: visible !important;
                            `);
                        }
                        
                        // 强制设置 Stack 具体像素值
                        lmStack.setAttribute('style', `
                            position: absolute !important;
                            top: 0 !important;
                            left: 0 !important;
                            width: ${itemsWidth}px !important;
                            height: ${appbodyHeight}px !important;
                            display: block !important;
                            visibility: visible !important;
                        `);
                        
                        console.log('Stack尺寸:', lmStack.offsetWidth, 'x', lmStack.offsetHeight);
                        console.log('计算Items尺寸:', itemsWidth, 'x', itemsHeight);
                        
                        // 使用 setAttribute 直接修改 style 属性
                        lmItems.setAttribute('style', `
                            position: absolute !important;
                            top: ${headerHeight}px !important;
                            left: 0 !important;
                            right: 0 !important;
                            bottom: 0 !important;
                            width: ${itemsWidth}px !important;
                            height: ${itemsHeight}px !important;
                            overflow: hidden !important;
                        `);
                        
                        // 修复所有子容器
                        const allContainers = lmItems.querySelectorAll('.lm_item_container');
                        allContainers.forEach((container, index) => {
                            // 只显示第一个容器（3D视图），其他隐藏
                            const display = index === 0 ? 'block' : 'none';
                            container.setAttribute('style', `
                                position: absolute !important;
                                top: 0 !important;
                                left: 0 !important;
                                width: ${itemsWidth}px !important;
                                height: ${itemsHeight}px !important;
                                display: ${display} !important;
                                visibility: visible !important;
                            `);
                        });
                        
                        // 修复所有 content 容器
                        const allContents = lmItems.querySelectorAll('.lm_content');
                        allContents.forEach(content => {
                            content.setAttribute('style', `
                                position: absolute !important;
                                top: 0 !important;
                                left: 0 !important;
                                width: ${itemsWidth}px !important;
                                height: ${itemsHeight}px !important;
                                display: block !important;
                                visibility: visible !important;
                            `);
                        });
                        
                        console.log('=== 最终尺寸检查 ===');
                        console.log('Items容器尺寸:', lmItems.offsetWidth, 'x', lmItems.offsetHeight);
                        console.log('Items容器 computed style:', window.getComputedStyle(lmItems).width, 'x', window.getComputedStyle(lmItems).height);
                        console.log('Items容器 display:', window.getComputedStyle(lmItems).display);
                        console.log('Items容器 visibility:', window.getComputedStyle(lmItems).visibility);
                        
                        // 检查父容器
                        console.log('Stack容器尺寸:', lmStack.offsetWidth, 'x', lmStack.offsetHeight);
                        console.log('Stack computed style:', window.getComputedStyle(lmStack).width, 'x', window.getComputedStyle(lmStack).height);
                        console.log('Stack display:', window.getComputedStyle(lmStack).display);
                        console.log('Stack visibility:', window.getComputedStyle(lmStack).visibility);
                        console.log('Stack opacity:', window.getComputedStyle(lmStack).opacity);
                        
                        console.log('Appbody尺寸:', appbody.offsetWidth, 'x', appbody.offsetHeight);
                        console.log('Appbody computed style:', window.getComputedStyle(appbody).width, 'x', window.getComputedStyle(appbody).height);
                        console.log('Appbody display:', window.getComputedStyle(appbody).display);
                        
                        if (lmRoot) {
                            console.log('lm_root尺寸:', lmRoot.offsetWidth, 'x', lmRoot.offsetHeight);
                            console.log('lm_root computed style:', window.getComputedStyle(lmRoot).width, 'x', window.getComputedStyle(lmRoot).height);
                            console.log('lm_root display:', window.getComputedStyle(lmRoot).display);
                            console.log('lm_root visibility:', window.getComputedStyle(lmRoot).visibility);
                        }
                        
                        const canvas = document.querySelector('canvas');
                        const monacoEditorEl = document.querySelector('.monaco-editor');
                        
                        if (canvas) {
                            console.log('Canvas尺寸:', canvas.offsetWidth, 'x', canvas.offsetHeight);
                            console.log('Canvas computed style:', window.getComputedStyle(canvas).width, 'x', window.getComputedStyle(canvas).height);
                        }
                        if (monacoEditorEl) {
                            console.log('Monaco编辑器尺寸:', monacoEditorEl.offsetWidth, 'x', monacoEditorEl.offsetHeight);
                            console.log('Monaco computed style:', window.getComputedStyle(monacoEditorEl).width, 'x', window.getComputedStyle(monacoEditorEl).height);
                        }
                        
                        // 强制更新Monaco编辑器布局
                        if (monacoEditor) {
                            console.log('更新Monaco编辑器布局');
                            monacoEditor.layout();
                            // 强制刷新编辑器显示
                            setTimeout(() => {
                                monacoEditor.layout();
                            }, 100);
                        }
                        
                        // 强制更新Three.js视图
                        if (threejsViewport && threejsViewport.renderer) {
                            console.log('更新Three.js渲染器');
                            threejsViewport.renderer.setSize(itemsWidth, itemsHeight);
                            if (threejsViewport.camera) {
                                threejsViewport.camera.aspect = itemsWidth / itemsHeight;
                                threejsViewport.camera.updateProjectionMatrix();
                            }
                            // 强制渲染一帧
                            threejsViewport.renderer.render(threejsViewport.scene, threejsViewport.camera);
                            console.log('Three.js 渲染完成');
                            
                            // 启动动画循环（如果有的话）
                            if (threejsViewport.animate && typeof threejsViewport.animate === 'function') {
                                threejsViewport.animate();
                            }
                        }
                        
                        console.log('=== 移动端初始化完成 ===');
                    }
                }, 100);
            }, 300);
        }, 500);
    }

    // If the Main Page loads before the CAD Worker, register a 
    // callback to start the model evaluation when the CAD is ready.
    messageHandlers["startupCallback"] = () => {
        startup = function () {
            // Reimport any previously imported STEP/IGES Files
            let curState = consoleGolden.getState();
            if (curState && Object.keys(curState).length > 0) {
                cascadeStudioWorker.postMessage({
                    "type": "loadPrexistingExternalFiles",
                    payload: consoleGolden.getState()
                });
            }

            monacoEditor.evaluateCode();
        }
        // Call the startup if we're ready when the wasm is ready
        startup();
    }
    // Otherwise, enqueue that call for when the Main Page is ready
    if (startup) { startup(); }

    // Register callbacks from the CAD Worker to add Sliders, Buttons, and Checkboxes to the UI
    // TODO: Enqueue these so the sliders are added/removed at the same time to eliminate flashing
    messageHandlers["addSlider"] = (payload) => {
        if (!(payload.name in GUIState)) { GUIState[payload.name] = payload.default; }
        const params = {
            min: payload.min,
            max: payload.max,
            step: payload.step,
        };
        if (payload.dp) {
            params.format = v => v.toFixed(payload.dp);
        }

        addGuiSeparator();
        const slider = gui.addInput(
            GUIState,
            payload.name,
            params
        );

        if (payload.realTime) {
            slider.on('change', e => {
                if (e.last) {
                    delayReloadEditor();
                }
            });
        }
    }
    messageHandlers["addButton"] = (payload) => {
        addGuiSeparator();
        gui.addButton({ title: payload.name, label: payload.label }).on('click', payload.callback);
    }

    messageHandlers["addCheckbox"] = (payload) => {
        if (!(payload.name in GUIState)) { GUIState[payload.name] = payload.default || false; }
        addGuiSeparator();
        gui.addInput(GUIState, payload.name).on('change', () => {
            delayReloadEditor();
        })
    }

    messageHandlers["addTextbox"] = (payload) => {
        if (!(payload.name in GUIState)) { GUIState[payload.name] = payload.default || ''; }
        addGuiSeparator();
        const input = gui.addInput(GUIState, payload.name)
        if (payload.realTime) {
            input.on('change', e => {
                if (e.last) {
                    delayReloadEditor();
                }
            })
        }
    }

    messageHandlers['addDropdown'] = (payload) => {
        if (!(payload.name in GUIState)) { GUIState[payload.name] = payload.default || ''; }
        const options = payload.options || {}

        addGuiSeparator();
        const input = gui.addInput(GUIState, payload.name, { options })
        if (payload.realTime) {
            input.on('change', e => {
                if (e.last) {
                    delayReloadEditor();
                }
            })
        }
    }

    messageHandlers["resetWorking"] = () => { window.workerWorking = false; }
}

function addGuiSeparator() {
    if (userGui && !guiSeparatorAdded) {
        guiSeparatorAdded = true;
        gui.addSeparator();
    }
}

/* Workaround for Tweakpane errors when tearing down gui during change event callbacks */
function delayReloadEditor() {
    setTimeout(() => { monacoEditor.evaluateCode(); }, 0);
}

async function getNewFileHandle(desc, mime, ext, open = false) {
    const options = {
      types: [
        {
          description: desc,
          accept: {
            [mime]: ['.' + ext],
          },
        },
      ],
    };
    if (open) {
        return await window.showOpenFilePicker(options);
    } else {
        return await window.showSaveFilePicker(options);
    }
}

async function writeFile(fileHandle, contents) {
    // Create a FileSystemWritableFileStream to write to.
    const writable = await fileHandle.createWritable();
    // Write the contents of the file to the stream.
    await writable.write(contents);
    // Close the file and write the contents to disk.
    await writable.close();
}

/** This function serializes the Project's current state 
 * into a `.json` file and saves it to the selected location. */
async function saveProject() {
    let currentCode = monacoEditor.getValue();
    if (!file.handle) {
        file.handle = await getNewFileHandle(
            "AI 3D Studio project files",
            "application/json",
            "json"
        );
    }

    codeContainer.setState({ code: currentCode.split(/\r\n|\r|\n/) });

    writeFile(file.handle, JSON.stringify(myLayout.toConfig(), null, 2)).then(() => {
        codeContainer.setTitle(file.handle.name);
        console.log("Saved project to " + file.handle.name);
        file.content = currentCode;
    });
}

async function downloadFile(data, name, mime, ext) {
    const blob = new Blob([data], { type: mime });
    const a = document.createElement("a");
    a.download = name + "." + ext;
    a.style.display = "none";
    a.href = window.URL.createObjectURL(blob);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(a.href);
}

/** This loads a .json file as the currentProject.*/
const loadProject = async () => {
    // Don't allow loading while the worker is working to prevent race conditions.
    if (window.workerWorking) { return; }

    // Load Project .json from a file
    [file.handle] = await getNewFileHandle(
        'AI 3D Studio project files',
        'application/json',
        'json',
        open = true
    );
    let fileSystemFile = await file.handle.getFile();
    let jsonContent = await fileSystemFile.text();
    window.history.replaceState({}, 'AI 3D Studio','?');
    initialize(projectContent=jsonContent);
    codeContainer.setTitle(file.handle.name);
    file.content = monacoEditor.getValue();
}

/** This function triggers the CAD WebWorker to 
 * load one or more  .stl, .step, or .iges files. */
function loadFiles(fileElementID = "files") {
    // Ask the worker thread to load these files... 
    // I can already feel this not working...
    let files = document.getElementById(fileElementID).files;
    cascadeStudioWorker.postMessage({
        "type": "loadFiles",
        "payload": files
    });

    // Receive a list of the imported files
    messageHandlers["loadFiles"] = (extFiles) => {
        console.log("Storing loaded files!");
        //console.log(extFiles);
        consoleGolden.setState(extFiles);
    };
}

/** This function clears all Externally Loaded files 
 * from the `externalFiles` dict. */
function clearExternalFiles() {
    cascadeStudioWorker.postMessage({
        "type": "clearExternalFiles"
    });
    consoleGolden.setState({});
}

/** This decodes a base64 and zipped string to the original version of that string */
function decode(string) { return RawDeflate.inflate(window.atob(decodeURIComponent(string))); }
/** This function encodes a string to a base64 and zipped version of that string */
function encode(string) { return encodeURIComponent(window.btoa(RawDeflate.deflate(string))); }

/** This function returns true if item is indexable like an array. */
function isArrayLike(item) {
    return (
        Array.isArray(item) || 
        (!!item &&
          typeof item === "object" &&
          item.hasOwnProperty("length") && 
          typeof item.length === "number" && 
          item.length > 0 && 
          (item.length - 1) in item
        )
    );
}
