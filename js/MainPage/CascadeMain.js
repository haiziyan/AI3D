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
`// Welcome to AI 3D Studio!   Here are some useful functions:
//  Translate(), Rotate(), Scale(), Mirror(), Union(), Difference(), Intersection()
//  Box(), Sphere(), Cylinder(), Cone(), Text3D(), Polygon()
//  Offset(), Extrude(), RotatedExtrude(), Revolve(), Pipe(), Loft(), 
//  FilletEdges(), ChamferEdges(),
//  Slider(), Checkbox(), TextInput(), Dropdown()

let holeRadius = Slider("Radius", 30 , 20 , 40);

let sphere     = Sphere(50);
let cylinderZ  =                     Cylinder(holeRadius, 200, true);
let cylinderY  = Rotate([0,1,0], 90, Cylinder(holeRadius, 200, true));
let cylinderX  = Rotate([1,0,0], 90, Cylinder(holeRadius, 200, true));

Translate([0, 0, 50], Difference(sphere, [cylinderX, cylinderY, cylinderZ]));

Translate([-25, 0, 40], Text3D("Hi!", 36, 0.15, 'Consolas'));

// Don't forget to push imported or oc-defined shapes into sceneShapes to add them to the workspace!`;

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
        });
    });

    // Set up the AI Module Component (with integrated console)
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
                <div class="console-output">
                    <div class="console-header">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="4 17 10 11 4 5"/>
                            <line x1="12" y1="19" x2="20" y2="19"/>
                        </svg>
                        控制台输出
                    </div>
                    <div id="consoleOutputContent" class="console-content"></div>
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

        // Overwrite the existing logging/error behaviour to print messages to the Console window
        if (!realConsoleLog) {
            realConsoleLog = console.log;
            
            console.log = function (message) {
                realConsoleLog.apply(console, arguments);
                
                // 如果控制台容器未初始化，将消息加入队列
                if (!consoleContainer) {
                    messageQueue.push({ type: 'log', message: message });
                    return;
                }
                
                let newline = document.createElement("div");
                newline.style.fontFamily = "monospace";
                newline.style.color = (alternatingColor = !alternatingColor) ? "LightGray" : "white";
                newline.style.fontSize = "1.2em";
                if (message !== undefined) {
                    let messageText = JSON.stringify(message, getCircularReplacer());
                    if (messageText.startsWith('"')) { messageText = messageText.slice(1, -1); }
                    newline.innerHTML = "&gt;  " + messageText;
                } else {
                    newline.innerHTML = "undefined";
                }
                consoleContainer.appendChild(newline);
                consoleContainer.scrollTop = consoleContainer.scrollHeight;
            };
            
            // 刷新消息队列到控制台
            window.flushConsoleQueue = function() {
                if (consoleContainer && messageQueue.length > 0) {
                    messageQueue.forEach(item => {
                        if (item.type === 'log') {
                            console.log(item.message);
                        } else if (item.type === 'error') {
                            // 处理错误消息
                            let newline = document.createElement("div");
                            newline.style.color = "red";
                            newline.style.fontFamily = "monospace";
                            newline.style.fontSize = "1.2em";
                            newline.innerHTML = item.message;
                            consoleContainer.appendChild(newline);
                        }
                    });
                    messageQueue = [];
                    consoleContainer.scrollTop = consoleContainer.scrollHeight;
                }
            };
            
            // Call this console.log when triggered from the WASM
            messageHandlers["log"  ] = (payload) => { console.log(payload); };
            messageHandlers["error"] = (payload) => { window.workerWorking = false; console.error(payload); };

            // Print Errors in Red
            window.onerror = function (err, url, line, colno, errorObj) {
                realConsoleLog.call(console, "Error:", err);
                
                // 如果控制台容器未初始化，将错误加入队列
                if (!consoleContainer) {
                    let errorText = JSON.stringify(err, getCircularReplacer());
                    if (errorText.startsWith('"')) { errorText = errorText.slice(1, -1); }
                    messageQueue.push({ type: 'error', message: "Line " + line + ": " + errorText });
                    return;
                }
                
                let newline = document.createElement("div");
                newline.style.color = "red";
                newline.style.fontFamily = "monospace";
                newline.style.fontSize = "1.2em";
                let errorText = JSON.stringify(err, getCircularReplacer());
                if (errorText.startsWith('"')) { errorText = errorText.slice(1, -1); }
                newline.innerHTML = "Line " + line + ": " + errorText;
                consoleContainer.appendChild(newline);
                consoleContainer.scrollTop = consoleContainer.scrollHeight;

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

            // If we've received a progress update from the Worker Thread, append it to our previous message
            messageHandlers["Progress"] = (payload) => {
                // Add a dot to the progress indicator for each progress message we find in the queue
                if (consoleContainer && consoleContainer.lastElementChild) {
                    consoleContainer.lastElementChild.innerText =
                        "> Generating Model" + ".".repeat(payload.opNumber) + ((payload.opType)? " ("+payload.opType+")" : "");
                }
            };

            // Print friendly welcoming messages
            console.log("Welcome to AI 3D Studio!");
            console.log("Loading CAD Kernel...");
        }
        
        // 设置控制台容器（在 console.log 重写之后）
        consoleContainer = document.getElementById('consoleOutputContent');
        
        // 调试：验证控制台容器是否正确初始化
        if (consoleContainer) {
            realConsoleLog("控制台容器已初始化:", consoleContainer);
        } else {
            realConsoleLog("错误：控制台容器未找到！");
        }
        
        // 立即刷新消息队列（如果有缓存的消息）
        if (window.flushConsoleQueue) {
            realConsoleLog("刷新消息队列，队列长度:", messageQueue.length);
            window.flushConsoleQueue();
        }
        
        // 测试：直接输出一条消息
        console.log("控制台测试消息 - 如果你看到这条消息，说明控制台工作正常！");
        
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
        const aiInputHeight = isMobile ? (document.getElementById('aiInputWrapper')?.offsetHeight || 150) : 0;
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
        const aiInputHeight = isMobile ? (aiInputWrapper?.offsetHeight || 150) : 0;
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
    
    const topnavHeight = document.getElementById('topnav').offsetHeight;
    const aiInputHeight = isMobile ? 150 : 0; // 移动端预留AI输入框高度
    const layoutHeight = window.innerHeight - topnavHeight - aiInputHeight;
    
    console.log('初始化布局尺寸:', window.innerWidth, 'x', layoutHeight);
    myLayout.updateSize(window.innerWidth, layoutHeight);
    
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
            
            console.log('3D视图容器:', cascadeView);
            console.log('代码编辑器容器:', codeEditor);
            console.log('AI模块容器:', aiModule);
            console.log('Canvas元素:', canvas);
            console.log('Monaco编辑器元素:', monacoEditorEl);
            console.log('Stack容器:', lmStack);
            console.log('Items容器:', lmItems);
            
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
            
            // 隐藏AI模块的Tab
            const tabs = document.querySelectorAll('.lm_tab');
            tabs.forEach(tab => {
                const title = tab.querySelector('.lm_title');
                if (title && title.textContent.includes('AI 生成器')) {
                    console.log('隐藏AI模块Tab');
                    tab.style.display = 'none';
                }
            });
            
            // 强制更新布局
            const topnavHeight = document.getElementById('topnav').offsetHeight;
            const aiInputHeight = document.getElementById('aiInputWrapper')?.offsetHeight || 150;
            const layoutHeight = window.innerHeight - topnavHeight - aiInputHeight;
            console.log('计算布局高度:', layoutHeight, '= 窗口高度', window.innerHeight, '- 导航栏', topnavHeight, '- AI输入框', aiInputHeight);
            
            myLayout.updateSize(window.innerWidth, layoutHeight);
            
            // 强制更新Monaco编辑器布局
            if (monacoEditor) {
                console.log('更新Monaco编辑器布局');
                monacoEditor.layout();
            }
            
            // 强制更新Three.js视图
            if (threejsViewport && threejsViewport.renderer) {
                const container = threejsViewport.container.getElement().get(0);
                const width = container.offsetWidth;
                const height = container.offsetHeight;
                console.log('更新Three.js渲染器尺寸:', width, 'x', height);
                threejsViewport.renderer.setSize(width, height);
                if (threejsViewport.camera) {
                    threejsViewport.camera.aspect = width / height;
                    threejsViewport.camera.updateProjectionMatrix();
                }
            }
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
