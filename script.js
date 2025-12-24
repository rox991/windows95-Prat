// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the OS
    const PortfolioOS = {
        // State variables
        windows: [],
        activeWindow: null,
        zIndexCounter: 100,
        soundEnabled: true,
        crtEnabled: false,
        isStartMenuOpen: false,
        isStartingUp: true,
        desktopIcons: [],
        taskbarApps: [],
        startupComplete: false,
        currentTheme: '#008080',
        
        // Sound elements
        sounds: {
            startup: null,
            click: null,
            windowOpen: null,
            windowClose: null,
            error: null,
            menuOpen: null,
            shutdown: null,
            game: null,
            themeChange: null
        },
        
        // DOM Elements
        elements: {
            startupScreen: null,
            desktop: null,
            taskbar: null,
            startButton: null,
            startMenu: null,
            windowsContainer: null,
            contextMenu: null,
            errorDialog: null,
            crtOverlay: null,
            shutdownScreen: null,
            clock: null,
            loadingProgress: null,
            loadingStatus: null,
            loadingPercent: null
        },
        
        // Initialize the OS
        init: function() {
            this.cacheElements();
            this.cacheSounds();
            this.bindEvents();
            this.initClock();
            this.startBootSequence();
            SnakeGame.init();
        },
        
        // Cache DOM elements
        cacheElements: function() {
            this.elements.startupScreen = document.getElementById('startup-screen');
            this.elements.desktop = document.getElementById('desktop');
            this.elements.taskbar = document.getElementById('taskbar');
            this.elements.startButton = document.getElementById('start-button');
            this.elements.startMenu = document.getElementById('start-menu');
            this.elements.windowsContainer = document.getElementById('windows-container');
            this.elements.contextMenu = document.getElementById('context-menu');
            this.elements.errorDialog = document.getElementById('error-dialog');
            this.elements.crtOverlay = document.getElementById('crt-overlay');
            this.elements.shutdownScreen = document.getElementById('shutdown-screen');
            this.elements.clock = document.getElementById('clock');
            this.elements.loadingProgress = document.getElementById('loading-progress');
            this.elements.loadingStatus = document.getElementById('loading-status');
            this.elements.loadingPercent = document.getElementById('loading-percent');
            
            // Cache desktop icons
            this.desktopIcons = document.querySelectorAll('.desktop-icon');
        },
        
        // Cache sound elements
        cacheSounds: function() {
            this.sounds.startup = document.getElementById('startup-sound');
            this.sounds.click = document.getElementById('click-sound');
            this.sounds.windowOpen = document.getElementById('window-open-sound');
            this.sounds.windowClose = document.getElementById('window-close-sound');
            this.sounds.error = document.getElementById('error-sound');
            this.sounds.menuOpen = document.getElementById('menu-open-sound');
            this.sounds.shutdown = document.getElementById('shutdown-sound');
            this.sounds.game = document.getElementById('game-sound');
            this.sounds.themeChange = document.getElementById('theme-change-sound');
        },
        
        // Play sound effect
        playSound: function(soundName) {
            if (!this.soundEnabled) return;
            
            const sound = this.sounds[soundName];
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(e => {
                    console.log('Sound play failed:', e);
                });
            }
        },
        
        // Bind event listeners
        bindEvents: function() {
            // Start button
            this.elements.startButton.addEventListener('click', (e) => {
                this.playSound('click');
                this.toggleStartMenu();
                e.stopPropagation();
            });
            
            // Start menu items
            document.querySelectorAll('.menu-item[data-app]').forEach(item => {
                item.addEventListener('click', (e) => {
                    this.playSound('click');
                    const app = item.getAttribute('data-app');
                    this.openApp(app);
                    this.closeStartMenu();
                    e.stopPropagation();
                });
            });
            
            // Desktop icons
            this.desktopIcons.forEach(icon => {
                icon.addEventListener('dblclick', (e) => {
                    this.playSound('click');
                    const app = icon.getAttribute('data-app');
                    this.openApp(app);
                });
                
                icon.addEventListener('click', (e) => {
                    this.playSound('click');
                    this.clearIconSelection();
                    icon.classList.add('selected');
                });
            });
            
            // Context menu
            document.addEventListener('contextmenu', (e) => {
                if (e.target.closest('.desktop')) {
                    e.preventDefault();
                    this.playSound('click');
                    this.showContextMenu(e.clientX, e.clientY);
                }
            });
            
            document.addEventListener('click', () => {
                this.hideContextMenu();
                this.clearIconSelection();
            });
            
            // Context menu items
            document.getElementById('context-refresh').addEventListener('click', () => {
                this.playSound('click');
                this.showError('This feature is not implemented in this demo.', 'Information');
                this.hideContextMenu();
            });
            
            document.getElementById('context-properties').addEventListener('click', () => {
                this.playSound('click');
                this.showError('Properties dialog is not available.', 'Information');
                this.hideContextMenu();
            });
            
            // Settings
            document.getElementById('theme-toggle').addEventListener('click', (e) => {
                e.stopPropagation();
                this.playSound('click');
                this.toggleCRTEffect();
            });
            
            document.getElementById('sound-toggle').addEventListener('click', (e) => {
                e.stopPropagation();
                this.playSound('click');
                this.toggleSound();
                const soundText = document.querySelector('#sound-toggle span');
                soundText.textContent = `Sound: ${this.soundEnabled ? 'ON' : 'OFF'}`;
            });
            
            document.getElementById('theme-color').addEventListener('click', (e) => {
                e.stopPropagation();
                this.playSound('click');
                this.openThemePicker();
            });
            
            // Theme color picker
            document.querySelectorAll('.theme-color-item').forEach(item => {
                item.addEventListener('click', () => {
                    this.playSound('click');
                    const color = item.getAttribute('data-color');
                    this.changeThemeColor(color);
                });
            });
            
            document.getElementById('theme-close').addEventListener('click', () => {
                this.playSound('click');
                this.closeThemePicker();
            });
            
            // Snake game controls
            document.getElementById('snake-close').addEventListener('click', () => {
                this.playSound('click');
                this.closeSnakeGame();
            });
            
            // Shutdown
            document.getElementById('menu-shutdown').addEventListener('click', () => {
                this.playSound('click');
                this.shutdown();
            });
            
            // CRT toggle
            document.getElementById('crt-toggle').addEventListener('click', () => {
                this.playSound('click');
                this.toggleCRTEffect();
            });
            
            // Error dialog OK button
            document.getElementById('error-ok').addEventListener('click', () => {
                this.playSound('click');
                this.hideError();
            });
            
            // Taskbar quick launch buttons
            document.querySelectorAll('.taskbar-icon').forEach(icon => {
                icon.addEventListener('click', (e) => {
                    this.playSound('click');
                    const app = icon.getAttribute('data-app');
                    this.openApp(app);
                });
            });
            
            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                // Alt+Tab - Cycle through windows
                if (e.altKey && e.key === 'Tab') {
                    e.preventDefault();
                    this.playSound('click');
                    this.cycleWindows();
                }
                
                // Escape - Close start menu or active window
                if (e.key === 'Escape') {
                    this.playSound('click');
                    if (this.isStartMenuOpen) {
                        this.closeStartMenu();
                    } else if (this.activeWindow) {
                        this.closeWindow(this.activeWindow.id);
                    }
                    if (document.getElementById('snake-game-modal').style.display === 'flex') {
                        this.closeSnakeGame();
                    }
                    if (document.getElementById('theme-modal').style.display === 'flex') {
                        this.closeThemePicker();
                    }
                }
                
                // F11 - Toggle CRT
                if (e.key === 'F11') {
                    e.preventDefault();
                    this.playSound('click');
                    this.toggleCRTEffect();
                }
            });
            
            // Window dragging
            document.addEventListener('mousedown', this.handleWindowDragStart.bind(this));
            document.addEventListener('mousemove', this.handleWindowDrag.bind(this));
            document.addEventListener('mouseup', this.handleWindowDragEnd.bind(this));
            
            // Touch events for mobile
            document.addEventListener('touchstart', this.handleTouchStart.bind(this));
            document.addEventListener('touchmove', this.handleTouchMove.bind(this));
            document.addEventListener('touchend', this.handleTouchEnd.bind(this));
            
            // Prevent text selection while dragging
            document.addEventListener('selectstart', (e) => {
                if (this.draggingWindow) {
                    e.preventDefault();
                }
            });
        },
        
        // Startup sequence
        startBootSequence: function() {
            let progress = 0;
            const bootSteps = [
                { percent: 10, text: "Checking system configuration..." },
                { percent: 25, text: "Loading kernel..." },
                { percent: 40, text: "Initializing drivers..." },
                { percent: 55, text: "Starting services..." },
                { percent: 70, text: "Loading desktop environment..." },
                { percent: 85, text: "Applying settings..." },
                { percent: 100, text: "Welcome to Portfolio OS!" }
            ];
            
            // Play startup sound
            setTimeout(() => {
                this.playSound('startup');
            }, 500);
            
            // Simulate boot process
            const bootInterval = setInterval(() => {
                if (progress >= bootSteps.length) {
                    clearInterval(bootInterval);
                    this.completeBoot();
                    return;
                }
                
                const step = bootSteps[progress];
                this.elements.loadingProgress.style.width = `${step.percent}%`;
                this.elements.loadingStatus.textContent = step.text;
                this.elements.loadingPercent.textContent = `${step.percent}%`;
                
                progress++;
            }, 500);
        },
        
        // Complete boot process
        completeBoot: function() {
            setTimeout(() => {
                this.elements.startupScreen.style.display = 'none';
                this.elements.desktop.style.display = 'block';
                this.startupComplete = true;
                
                // Show welcome message
                setTimeout(() => {
                    this.showError('Welcome to my Windows 95 portfolio! Double-click icons or use the Start menu to explore.', 'Welcome');
                }, 500);
            }, 1000);
        },
        
        // Toggle start menu
        toggleStartMenu: function() {
            if (this.isStartMenuOpen) {
                this.closeStartMenu();
            } else {
                this.openStartMenu();
            }
        },
        
        openStartMenu: function() {
            this.playSound('menuOpen');
            this.elements.startMenu.classList.add('active');
            this.elements.startButton.classList.add('active');
            this.isStartMenuOpen = true;
        },
        
        closeStartMenu: function() {
            this.playSound('click');
            this.elements.startMenu.classList.remove('active');
            this.elements.startButton.classList.remove('active');
            this.isStartMenuOpen = false;
        },
        
        // Open application
        openApp: function(appId) {
            // Close existing window of same type
            const existingWindow = this.windows.find(w => w.appId === appId && !w.minimized);
            if (existingWindow) {
                this.bringToFront(existingWindow.id);
                return;
            }
            
            let windowConfig;
            
            switch(appId) {
                case 'about':
                    windowConfig = {
                        id: `window-${Date.now()}`,
                        appId: 'about',
                        title: 'About Me',
                        icon: 'fas fa-user',
                        width: 500,
                        height: 400,
                        content: this.getAboutContent()
                    };
                    break;
                    
                case 'projects':
                    windowConfig = {
                        id: `window-${Date.now()}`,
                        appId: 'projects',
                        title: 'My Projects',
                        icon: 'fas fa-folder-open',
                        width: 600,
                        height: 450,
                        content: this.getProjectsContent()
                    };
                    break;
                    
                case 'skills':
                    windowConfig = {
                        id: `window-${Date.now()}`,
                        appId: 'skills',
                        title: 'Skills & Settings',
                        icon: 'fas fa-cogs',
                        width: 500,
                        height: 400,
                        content: this.getSkillsContent()
                    };
                    break;
                    
                case 'contact':
                    windowConfig = {
                        id: `window-${Date.now()}`,
                        appId: 'contact',
                        title: 'Contact Me',
                        icon: 'fas fa-envelope',
                        width: 500,
                        height: 450,
                        content: this.getContactContent()
                    };
                    break;
                    
                case 'education':
                    windowConfig = {
                        id: `window-${Date.now()}`,
                        appId: 'education',
                        title: 'Education',
                        icon: 'fas fa-graduation-cap',
                        width: 500,
                        height: 450,
                        content: this.getEducationContent()
                    };
                    break;
                    
                case 'social':
                    windowConfig = {
                        id: `window-${Date.now()}`,
                        appId: 'social',
                        title: 'Social Links',
                        icon: 'fas fa-share-alt',
                        width: 500,
                        height: 400,
                        content: this.getSocialContent()
                    };
                    break;
                    
                case 'games':
                    this.openSnakeGame();
                    return;
                    
                case 'resume':
                    windowConfig = {
                        id: `window-${Date.now()}`,
                        appId: 'resume',
                        title: 'My Resume',
                        icon: 'fas fa-file-download',
                        width: 400,
                        height: 350,
                        content: this.getResumeContent()
                    };
                    break;
                    
                default:
                    this.showError(`Application "${appId}" not found.`, 'Error');
                    return;
            }
            
            // Set initial position (staggered)
            const offset = this.windows.length * 30;
            windowConfig.x = 100 + offset;
            windowConfig.y = 100 + offset;
            
            this.createWindow(windowConfig);
        },
        
        // Create window element
        createWindow: function(config) {
            // Play window open sound
            this.playSound('windowOpen');
            
            // Create window element
            const windowEl = document.createElement('div');
            windowEl.className = 'window';
            windowEl.id = config.id;
            windowEl.style.width = `${config.width}px`;
            windowEl.style.height = `${config.height}px`;
            windowEl.style.left = `${config.x}px`;
            windowEl.style.top = `${config.y}px`;
            windowEl.style.zIndex = this.zIndexCounter++;
            
            // Window header
            windowEl.innerHTML = `
                <div class="window-header">
                    <div class="window-title">
                        <i class="${config.icon}"></i>
                        <span>${config.title}</span>
                    </div>
                    <div class="window-controls">
                        <button class="window-btn minimize" title="Minimize">
                            <i class="fas fa-window-minimize"></i>
                        </button>
                        <button class="window-btn maximize" title="Maximize">
                            <i class="fas fa-window-maximize"></i>
                        </button>
                        <button class="window-btn close" title="Close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="window-content">
                    ${config.content}
                </div>
            `;
            
            // Add to DOM
            this.elements.windowsContainer.appendChild(windowEl);
            
            // Store window data
            const windowData = {
                id: config.id,
                appId: config.appId,
                element: windowEl,
                title: config.title,
                minimized: false,
                maximized: false,
                originalDimensions: {
                    width: config.width,
                    height: config.height,
                    x: config.x,
                    y: config.y
                }
            };
            
            this.windows.push(windowData);
            this.bringToFront(config.id);
            this.addToTaskbar(windowData);
            
            // Bind window controls
            this.bindWindowControls(windowEl, windowData);
            
            // Animate skill bars if it's the skills window
            if (config.appId === 'skills') {
                setTimeout(() => {
                    this.animateSkillBars();
                }, 100);
            }
            
            // Bind project card clicks
            if (config.appId === 'projects') {
                setTimeout(() => {
                    document.querySelectorAll('.project-card').forEach(card => {
                        card.addEventListener('click', () => {
                            this.playSound('click');
                            const projectTitle = card.querySelector('h4').textContent;
                            this.showError(`Opening project: ${projectTitle}`, 'Project Info');
                        });
                    });
                }, 100);
            }
            
            // Bind contact form
            if (config.appId === 'contact') {
                setTimeout(() => {
                    this.bindContactForm(windowEl);
                }, 100);
            }
            
            // Bind social links
            if (config.appId === 'social') {
                setTimeout(() => {
                    this.bindSocialLinks(windowEl);
                }, 100);
            }
            
            // Bind resume download button
            if (config.appId === 'resume') {
                setTimeout(() => {
                    const downloadBtn = windowEl.querySelector('.download-btn');
                    if (downloadBtn) {
                        downloadBtn.addEventListener('click', () => {
                            this.playSound('click');
                            this.downloadResume();
                        });
                    }
                }, 100);
            }
            
            return windowData;
        },
        
        // Bind window control buttons
        bindWindowControls: function(windowEl, windowData) {
            const minimizeBtn = windowEl.querySelector('.minimize');
            const maximizeBtn = windowEl.querySelector('.maximize');
            const closeBtn = windowEl.querySelector('.close');
            const header = windowEl.querySelector('.window-header');
            
            minimizeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.playSound('click');
                this.minimizeWindow(windowData.id);
            });
            
            maximizeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.playSound('click');
                this.toggleMaximizeWindow(windowData.id);
            });
            
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.playSound('windowClose');
                this.closeWindow(windowData.id);
            });
            
            header.addEventListener('click', () => {
                this.playSound('click');
                this.bringToFront(windowData.id);
            });
            
            // Double-click header to maximize
            header.addEventListener('dblclick', () => {
                this.playSound('click');
                this.toggleMaximizeWindow(windowData.id);
            });
        },
        
        // Bring window to front
        bringToFront: function(windowId) {
            const windowData = this.windows.find(w => w.id === windowId);
            if (!windowData) return;
            
            // Play sound
            this.playSound('click');
            
            // Update z-index for all windows
            this.windows.forEach(w => {
                w.element.style.zIndex = 10;
                w.element.classList.remove('active');
            });
            
            windowData.element.style.zIndex = this.zIndexCounter++;
            windowData.element.classList.add('active');
            this.activeWindow = windowData;
            
            // Update taskbar
            this.updateTaskbarActive(windowId);
        },
        
        // Minimize window
        minimizeWindow: function(windowId) {
            const windowData = this.windows.find(w => w.id === windowId);
            if (!windowData) return;
            
            windowData.minimized = !windowData.minimized;
            
            if (windowData.minimized) {
                windowData.element.classList.add('minimizing');
                setTimeout(() => {
                    windowData.element.style.display = 'none';
                    windowData.element.classList.remove('minimizing');
                }, 300);
                
                // Update taskbar
                this.updateTaskbarMinimized(windowId, true);
            } else {
                windowData.element.style.display = 'flex';
                this.bringToFront(windowId);
                
                // Update taskbar
                this.updateTaskbarMinimized(windowId, false);
            }
        },
        
        // Toggle maximize window
        toggleMaximizeWindow: function(windowId) {
            const windowData = this.windows.find(w => w.id === windowId);
            if (!windowData) return;
            
            windowData.maximized = !windowData.maximized;
            
            if (windowData.maximized) {
                // Store original position and size
                windowData.originalDimensions = {
                    width: windowData.element.offsetWidth,
                    height: windowData.element.offsetHeight,
                    x: parseInt(windowData.element.style.left),
                    y: parseInt(windowData.element.style.top)
                };
                
                windowData.element.classList.add('maximizing', 'maximized');
                setTimeout(() => {
                    windowData.element.classList.remove('maximizing');
                }, 300);
            } else {
                windowData.element.classList.remove('maximized');
                windowData.element.style.width = `${windowData.originalDimensions.width}px`;
                windowData.element.style.height = `${windowData.originalDimensions.height}px`;
                windowData.element.style.left = `${windowData.originalDimensions.x}px`;
                windowData.element.style.top = `${windowData.originalDimensions.y}px`;
            }
        },
        
        // Close window
        closeWindow: function(windowId) {
            const windowData = this.windows.find(w => w.id === windowId);
            if (!windowData) return;
            
            // Remove from taskbar
            this.removeFromTaskbar(windowId);
            
            // Remove from windows array
            const index = this.windows.findIndex(w => w.id === windowId);
            if (index !== -1) {
                this.windows.splice(index, 1);
            }
            
            // Remove element with animation
            windowData.element.classList.add('minimizing');
            setTimeout(() => {
                if (windowData.element.parentNode) {
                    windowData.element.parentNode.removeChild(windowData.element);
                }
                
                // Set new active window if available
                if (this.activeWindow && this.activeWindow.id === windowId) {
                    this.activeWindow = this.windows.length > 0 ? this.windows[this.windows.length - 1] : null;
                    if (this.activeWindow) {
                        this.bringToFront(this.activeWindow.id);
                    }
                }
            }, 300);
        },
        
        // Add window to taskbar
        addToTaskbar: function(windowData) {
            const taskbarApps = document.getElementById('taskbar-apps');
            
            // Check if already in taskbar
            if (document.getElementById(`taskbar-${windowData.id}`)) {
                return;
            }
            
            const appEl = document.createElement('div');
            appEl.className = 'taskbar-app';
            appEl.id = `taskbar-${windowData.id}`;
            appEl.innerHTML = `
                <i class="${windowData.appId === 'about' ? 'fas fa-user' : 
                          windowData.appId === 'projects' ? 'fas fa-folder' : 
                          windowData.appId === 'skills' ? 'fas fa-cogs' : 
                          windowData.appId === 'contact' ? 'fas fa-envelope' : 
                          windowData.appId === 'education' ? 'fas fa-graduation-cap' :
                          windowData.appId === 'social' ? 'fas fa-share-alt' :
                          windowData.appId === 'resume' ? 'fas fa-file-download' : 
                          'fas fa-trash-alt'}"></i>
                <span>${windowData.title}</span>
            `;
            
            appEl.addEventListener('click', () => {
                this.playSound('click');
                if (windowData.minimized) {
                    this.minimizeWindow(windowData.id);
                } else {
                    this.bringToFront(windowData.id);
                }
            });
            
            taskbarApps.appendChild(appEl);
            this.taskbarApps.push({
                id: windowData.id,
                element: appEl
            });
            
            this.updateTaskbarActive(windowData.id);
        },
        
        // Update taskbar active state
        updateTaskbarActive: function(windowId) {
            document.querySelectorAll('.taskbar-app').forEach(app => {
                app.classList.remove('active');
            });
            
            const taskbarApp = document.getElementById(`taskbar-${windowId}`);
            if (taskbarApp) {
                taskbarApp.classList.add('active');
            }
        },
        
        // Update taskbar minimized state
        updateTaskbarMinimized: function(windowId, minimized) {
            const taskbarApp = document.getElementById(`taskbar-${windowId}`);
            if (taskbarApp) {
                if (minimized) {
                    taskbarApp.classList.remove('active');
                } else {
                    taskbarApp.classList.add('active');
                }
            }
        },
        
        // Remove from taskbar
        removeFromTaskbar: function(windowId) {
            const taskbarApp = document.getElementById(`taskbar-${windowId}`);
            if (taskbarApp && taskbarApp.parentNode) {
                taskbarApp.parentNode.removeChild(taskbarApp);
            }
            
            const index = this.taskbarApps.findIndex(app => app.id === windowId);
            if (index !== -1) {
                this.taskbarApps.splice(index, 1);
            }
        },
        
        // Cycle through windows (Alt+Tab)
        cycleWindows: function() {
            if (this.windows.length === 0) return;
            
            const currentIndex = this.windows.findIndex(w => w.id === this.activeWindow?.id);
            const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % this.windows.length;
            
            this.bringToFront(this.windows[nextIndex].id);
        },
        
        // Window dragging
        draggingWindow: null,
        dragOffset: { x: 0, y: 0 },
        
        handleWindowDragStart: function(e) {
            if (!e.target.closest('.window-header')) return;
            
            const windowEl = e.target.closest('.window');
            if (!windowEl) return;
            
            const windowData = this.windows.find(w => w.element === windowEl);
            if (!windowData || windowData.maximized) return;
            
            this.draggingWindow = windowData;
            this.bringToFront(windowData.id);
            
            const rect = windowEl.getBoundingClientRect();
            this.dragOffset.x = e.clientX - rect.left;
            this.dragOffset.y = e.clientY - rect.top;
            
            e.preventDefault();
        },
        
        handleWindowDrag: function(e) {
            if (!this.draggingWindow) return;
            
            const windowEl = this.draggingWindow.element;
            const x = e.clientX - this.dragOffset.x;
            const y = e.clientY - this.dragOffset.y;
            
            // Boundary checking
            const maxX = window.innerWidth - windowEl.offsetWidth;
            const maxY = window.innerHeight - windowEl.offsetHeight - 40; // Account for taskbar
            
            windowEl.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
            windowEl.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
        },
        
        handleWindowDragEnd: function() {
            this.draggingWindow = null;
        },
        
        // Touch handling
        handleTouchStart: function(e) {
            if (e.target.closest('.window-header')) {
                const windowEl = e.target.closest('.window');
                if (!windowEl) return;
                
                const windowData = this.windows.find(w => w.element === windowEl);
                if (!windowData || windowData.maximized) return;
                
                this.draggingWindow = windowData;
                this.bringToFront(windowData.id);
                
                const rect = windowEl.getBoundingClientRect();
                const touch = e.touches[0];
                this.dragOffset.x = touch.clientX - rect.left;
                this.dragOffset.y = touch.clientY - rect.top;
                
                e.preventDefault();
            }
        },
        
        handleTouchMove: function(e) {
            if (!this.draggingWindow) return;
            
            const windowEl = this.draggingWindow.element;
            const touch = e.touches[0];
            const x = touch.clientX - this.dragOffset.x;
            const y = touch.clientY - this.dragOffset.y;
            
            // Boundary checking
            const maxX = window.innerWidth - windowEl.offsetWidth;
            const maxY = window.innerHeight - windowEl.offsetHeight - 40;
            
            windowEl.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
            windowEl.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
            
            e.preventDefault();
        },
        
        handleTouchEnd: function() {
            this.draggingWindow = null;
        },
        
        // Show context menu
        showContextMenu: function(x, y) {
            const contextMenu = this.elements.contextMenu;
            contextMenu.style.left = `${x}px`;
            contextMenu.style.top = `${y}px`;
            contextMenu.style.display = 'block';
            
            // Ensure menu stays within viewport
            const rect = contextMenu.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                contextMenu.style.left = `${window.innerWidth - rect.width - 5}px`;
            }
            if (rect.bottom > window.innerHeight) {
                contextMenu.style.top = `${window.innerHeight - rect.height - 5}px`;
            }
        },
        
        hideContextMenu: function() {
            this.elements.contextMenu.style.display = 'none';
        },
        
        clearIconSelection: function() {
            this.desktopIcons.forEach(icon => {
                icon.classList.remove('selected');
            });
        },
        
        // Toggle CRT effect
        toggleCRTEffect: function() {
            this.crtEnabled = !this.crtEnabled;
            this.elements.crtOverlay.classList.toggle('crt-on', this.crtEnabled);
            
            if (this.crtEnabled) {
                this.showError('CRT effect enabled. Press F11 to toggle.', 'Display Settings');
            } else {
                this.showError('CRT effect disabled. Press F11 to toggle.', 'Display Settings');
            }
        },
        
        // Toggle sound
        toggleSound: function() {
            this.soundEnabled = !this.soundEnabled;
            
            const message = this.soundEnabled ? 
                'Sound enabled.' : 
                'Sound disabled.';
            this.showError(message, 'Audio Settings');
        },
        
        // Open theme picker
        openThemePicker: function() {
            document.getElementById('theme-modal').style.display = 'flex';
            this.bringModalToFront('theme-modal');
        },
        
        closeThemePicker: function() {
            document.getElementById('theme-modal').style.display = 'none';
        },
        
        // Bring modal to front
        bringModalToFront: function(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.zIndex = this.zIndexCounter++;
            }
        },
        
        // Change theme color
        changeThemeColor: function(color) {
            this.playSound('themeChange');
            this.currentTheme = color;
            
            // Update CSS variables
            document.documentElement.style.setProperty('--theme-color', color);
            
            // Update taskbar start button gradient
            const startButtons = document.querySelectorAll('.start-button');
            startButtons.forEach(btn => {
                btn.style.background = `linear-gradient(to right, ${color}, ${this.lightenColor(color, 30)})`;
            });
            
            // Update window headers
            const windowHeaders = document.querySelectorAll('.window-header');
            windowHeaders.forEach(header => {
                header.style.background = `linear-gradient(to right, ${color}, ${this.lightenColor(color, 30)})`;
            });
            
            // Update desktop background
            document.body.style.backgroundColor = color;
            
            // Store in localStorage
            localStorage.setItem('portfolioTheme', color);
            
            this.closeThemePicker();
            this.showError(`Theme color changed to ${this.getColorName(color)}`, 'Theme Settings');
        },
        
        // Helper to lighten color
        lightenColor: function(color, percent) {
            const num = parseInt(color.replace('#', ''), 16);
            const amt = Math.round(2.55 * percent);
            const R = (num >> 16) + amt;
            const G = (num >> 8 & 0x00FF) + amt;
            const B = (num & 0x0000FF) + amt;
            
            return `#${(
                0x1000000 + 
                (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
                (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
                (B < 255 ? B < 1 ? 0 : B : 255)
            ).toString(16).slice(1)}`;
        },
        
        // Get color name from hex
        getColorName: function(hex) {
            const colors = {
                '#008080': 'Windows 95 Teal',
                '#000080': 'Classic Blue',
                '#800080': 'Purple',
                '#008000': 'Green',
                '#800000': 'Maroon',
                '#808000': 'Olive',
                '#000000': 'Black',
                '#808080': 'Gray'
            };
            return colors[hex] || hex;
        },
        
        // Load saved theme
        loadSavedTheme: function() {
            const savedTheme = localStorage.getItem('portfolioTheme');
            if (savedTheme) {
                this.currentTheme = savedTheme;
                this.changeThemeColor(savedTheme);
            }
        },
        
        // Show error dialog
        showError: function(message, title = 'Error') {
            this.playSound('error');
            const errorDialog = this.elements.errorDialog;
            document.getElementById('error-message').textContent = message;
            document.querySelector('.error-title').textContent = title;
            
            errorDialog.style.display = 'block';
            errorDialog.style.zIndex = this.zIndexCounter++;
            
            // Center dialog
            errorDialog.style.left = '50%';
            errorDialog.style.top = '50%';
            errorDialog.style.transform = 'translate(-50%, -50%)';
        },
        
        hideError: function() {
            this.elements.errorDialog.style.display = 'none';
        },
        
        // Initialize clock
        initClock: function() {
            const updateClock = () => {
                const now = new Date();
                let hours = now.getHours();
                const minutes = now.getMinutes().toString().padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                
                hours = hours % 12;
                hours = hours ? hours : 12; // 0 should be 12
                hours = hours.toString().padStart(2, '0');
                
                this.elements.clock.textContent = `${hours}:${minutes} ${ampm}`;
            };
            
            updateClock();
            setInterval(updateClock, 1000);
        },
        
        // Open Snake Game
        openSnakeGame: function() {
            this.playSound('game');
            document.getElementById('snake-game-modal').style.display = 'flex';
            this.bringModalToFront('snake-game-modal');
        },
        
        closeSnakeGame: function() {
            document.getElementById('snake-game-modal').style.display = 'none';
            SnakeGame.stopGame();
        },
        
        // Shutdown sequence
        shutdown: function() {
            this.playSound('shutdown');
            this.closeStartMenu();
            
            // Close all windows
            this.windows.forEach(window => {
                this.closeWindow(window.id);
            });
            
            // Show shutdown screen
            setTimeout(() => {
                this.elements.desktop.style.display = 'none';
                this.elements.shutdownScreen.style.display = 'flex';
                
                // Reset after 5 seconds
                setTimeout(() => {
                    this.elements.shutdownScreen.style.display = 'none';
                    this.elements.startupScreen.style.display = 'flex';
                    this.elements.desktop.style.display = 'block';
                    
                    // Show welcome message again
                    setTimeout(() => {
                        this.showError('Welcome back!', 'System Restarted');
                    }, 500);
                }, 5000);
            }, 500);
        },
        
        // Get window content templates
        getAboutContent: function() {
            return `
                <h3>About Me</h3>
                <div class="profile-container">
                    <div class="profile-image">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="profile-text">
                        <p>Hello! I'm Pratik Roy, a passionate Class 12 student preparing for JEE while pursuing my love for coding and technology.</p>
                        <p>This portfolio is built to mimic the classic Windows 95 interface while showcasing my skills in HTML, CSS, and JavaScript.</p>
                        <p>I specialize in creating interactive, visually appealing web applications with attention to detail and user experience.</p>
                    </div>
                </div>
                <div style="margin-top: 20px;">
                    <h4>Contact Information</h4>
                    <p><strong>Email:</strong> roypratik1554@gmail.com</p>
                    <p><strong>Location:</strong> India</p>
                    <p><strong>Status:</strong> Student & Developer</p>
                </div>
            `;
        },
        
        getEducationContent: function() {
            return `
                <h3>My Education Journey</h3>
                <p>Currently pursuing my academic goals while developing my programming skills:</p>
                
                <div class="education-timeline">
                    <div class="timeline-item">
                        <div class="timeline-year">2023-2024</div>
                        <div class="timeline-content">
                            <h4>Class 12 - Science Stream (PCM)</h4>
                            <p>Currently in Class 12 with Physics, Chemistry, and Mathematics as main subjects. Maintaining excellent academic record while balancing coding projects.</p>
                        </div>
                    </div>
                    
                    <div class="timeline-item">
                        <div class="timeline-year">2022-Present</div>
                        <div class="timeline-content">
                            <h4>JEE (Joint Entrance Examination) Preparation</h4>
                            <p>Preparing for one of India's most competitive engineering entrance exams. Developing strong problem-solving skills that complement my programming abilities.</p>
                        </div>
                    </div>
                    
                    <div class="timeline-item">
                        <div class="timeline-year">2020-Present</div>
                        <div class="timeline-content">
                            <h4>Self-Taught Programmer</h4>
                            <p>Learned web development through online resources, building projects, and consistent practice. Developed expertise in frontend technologies and UI/UX design.</p>
                        </div>
                    </div>
                    
                    <div class="timeline-item">
                        <div class="timeline-year">Future Goals</div>
                        <div class="timeline-content">
                            <h4>Computer Science Engineering</h4>
                            <p>Aiming to pursue Computer Science Engineering to further enhance my technical skills and work on innovative projects in software development.</p>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 20px; padding: 10px; background-color: #dfdfdf; border: 2px solid #808080;">
                    <h4>Academic & Coding Balance</h4>
                    <p>I believe in the synergy between academic learning and practical coding skills. My JEE preparation has enhanced my logical thinking, which directly benefits my programming projects.</p>
                </div>
            `;
        },
        
        getSocialContent: function() {
            return `
                <h3>Connect With Me</h3>
                <p>Let's connect on these platforms:</p>
                
                <div class="social-links">
                    <a href="https://github.com/rox991" target="_blank" class="social-link github" onclick="PortfolioOS.playSound('click')">
                        <i class="fab fa-github"></i>
                        <div class="social-info">
                            <h4>GitHub</h4>
                            <p>github.com/rox991</p>
                            <p>Check out my coding projects and contributions</p>
                        </div>
                    </a>
                    
                    <a href="https://instagram.com/_prat_7r" target="_blank" class="social-link instagram" onclick="PortfolioOS.playSound('click')">
                        <i class="fab fa-instagram"></i>
                        <div class="social-info">
                            <h4>Instagram</h4>
                            <p>@_prat_7r</p>
                            <p>Follow for updates and behind-the-scenes</p>
                        </div>
                    </a>
                    
                    <div class="social-link" style="cursor: default; background-color: #ffffcc;">
                        <i class="fas fa-heart" style="color: #ff0000;"></i>
                        <div class="social-info">
                            <h4>Let's Collaborate!</h4>
                            <p>Open to interesting projects and learning opportunities</p>
                            <p>Feel free to reach out for coding discussions or collaborations</p>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 20px; font-size: 12px; color: #606060;">
                    <p><strong>Note:</strong> Links will open in a new tab</p>
                </div>
            `;
        },
        
        getProjectsContent: function() {
            return `
                <h3>My Projects</h3>
                <p>Here are some of my recent projects. Click on any project for more details.</p>
                <div class="project-grid">
                    <div class="project-card">
                        <h4>Windows 95 Portfolio</h4>
                        <p>A fully interactive Windows 95 themed portfolio built with vanilla JavaScript.</p>
                    </div>
                    <div class="project-card">
                        <h4>JEE Preparation Assistant</h4>
                        <p>Web app with physics, chemistry, and math problem solvers and practice tests.</p>
                    </div>
                    <div class="project-card">
                        <h4>Interactive Snake Game</h4>
                        <p>Classic snake game with touch controls and progressive difficulty levels.</p>
                    </div>
                    <div class="project-card">
                        <h4>Science Calculator Suite</h4>
                        <p>Collection of scientific calculators for physics and chemistry problems.</p>
                    </div>
                    <div class="project-card">
                        <h4>Task Manager App</h4>
                        <p>Productivity app with Pomodoro timer and task organization features.</p>
                    </div>
                    <div class="project-card">
                        <h4>Responsive Weather App</h4>
                        <p>Weather application with location detection and 5-day forecasts.</p>
                    </div>
                </div>
            `;
        },
        
        getSkillsContent: function() {
            return `
                <h3>Technical Skills</h3>
                <p>My proficiency in various technologies and tools:</p>
                <div class="skill-list">
                    <div class="skill-item">
                        <div class="skill-header">
                            <span class="skill-name">HTML/CSS</span>
                            <span class="skill-percent">95%</span>
                        </div>
                        <div class="skill-bar">
                            <div class="skill-progress" data-percent="95"></div>
                        </div>
                    </div>
                    <div class="skill-item">
                        <div class="skill-header">
                            <span class="skill-name">JavaScript</span>
                            <span class="skill-percent">90%</span>
                        </div>
                        <div class="skill-bar">
                            <div class="skill-progress" data-percent="90"></div>
                        </div>
                    </div>
                    <div class="skill-item">
                        <div class="skill-header">
                            <span class="skill-name">UI/UX Design</span>
                            <span class="skill-percent">85%</span>
                        </div>
                        <div class="skill-bar">
                            <div class="skill-progress" data-percent="85"></div>
                        </div>
                    </div>
                    <div class="skill-item">
                        <div class="skill-header">
                            <span class="skill-name">Responsive Design</span>
                            <span class="skill-percent">88%</span>
                        </div>
                        <div class="skill-bar">
                            <div class="skill-progress" data-percent="88"></div>
                        </div>
                    </div>
                    <div class="skill-item">
                        <div class="skill-header">
                            <span class="skill-name">Problem Solving</span>
                            <span class="skill-percent">92%</span>
                        </div>
                        <div class="skill-bar">
                            <div class="skill-progress" data-percent="92"></div>
                        </div>
                    </div>
                    <div class="skill-item">
                        <div class="skill-header">
                            <span class="skill-name">Git & Version Control</span>
                            <span class="skill-percent">85%</span>
                        </div>
                        <div class="skill-bar">
                            <div class="skill-progress" data-percent="85"></div>
                        </div>
                    </div>
                </div>
            `;
        },
        
        getContactContent: function() {
            return `
                <h3>Contact Me</h3>
                <p>Feel free to get in touch with me for collaborations or opportunities.</p>
                <form class="contact-form" id="contact-form">
                    <div class="form-group">
                        <label for="contact-name">Name:</label>
                        <input type="text" id="contact-name" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="contact-email">Email:</label>
                        <input type="email" id="contact-email" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="contact-subject">Subject:</label>
                        <input type="text" id="contact-subject" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="contact-message">Message:</label>
                        <textarea id="contact-message" class="form-control" rows="5" required></textarea>
                    </div>
                    <div class="form-buttons">
                        <button type="submit" class="btn btn-primary">Send Message</button>
                        <button type="reset" class="btn">Clear</button>
                    </div>
                </form>
            `;
        },
        
        getResumeContent: function() {
            return `
                <div class="resume-content">
                    <div class="resume-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <h3>My Resume</h3>
                    <p>Download my complete resume with detailed experience, education, and references.</p>
                    <p>The resume includes:</p>
                    <ul style="text-align: left; margin: 15px 0; padding-left: 20px;">
                        <li>Academic Achievements</li>
                        <li>Technical Skills & Projects</li>
                        <li>Education Details</li>
                        <li>Certifications</li>
                        <li>Contact Information</li>
                    </ul>
                    <button class="download-btn">Download Resume (PDF)</button>
                </div>
            `;
        },
        
        // Animate skill bars
        animateSkillBars: function() {
            document.querySelectorAll('.skill-progress').forEach(bar => {
                const percent = bar.getAttribute('data-percent');
                bar.style.width = `${percent}%`;
            });
        },
        
        // Bind contact form
        bindContactForm: function(windowEl) {
            const form = windowEl.querySelector('#contact-form');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.playSound('click');
                
                const name = document.getElementById('contact-name').value;
                const email = document.getElementById('contact-email').value;
                const subject = document.getElementById('contact-subject').value;
                const message = document.getElementById('contact-message').value;
                
                // Simple validation
                if (!name || !email || !subject || !message) {
                    this.showError('Please fill in all fields.', 'Validation Error');
                    return;
                }
                
                // Email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    this.showError('Please enter a valid email address.', 'Validation Error');
                    return;
                }
                
                // In a real app, this would send to a server
                this.showError(`Thank you, ${name}! Your message has been sent. I'll get back to you soon.`, 'Message Sent');
                form.reset();
            });
            
            // Bind reset button
            const resetBtn = form.querySelector('button[type="reset"]');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    this.playSound('click');
                });
            }
        },
        
        // Bind social links
        bindSocialLinks: function(windowEl) {
            const links = windowEl.querySelectorAll('.social-link');
            links.forEach(link => {
                if (link.getAttribute('href')) {
                    link.addEventListener('click', (e) => {
                        this.playSound('click');
                    });
                }
            });
        },
        
        // Download resume
        downloadResume: function() {
            // Create a fake download
            this.showError('Resume downloaded successfully! (This is a demo - in a real app, this would download a PDF)', 'Download Complete');
        }
    };
    
    // Snake Game Module
    const SnakeGame = {
        canvas: null,
        ctx: null,
        gridSize: 20,
        snake: [],
        direction: 'right',
        nextDirection: 'right',
        food: { x: 0, y: 0 },
        score: 0,
        highScore: 0,
        gameSpeed: 150,
        isRunning: false,
        isPaused: false,
        gameLoop: null,
        level: 1,
        gridWidth: 20,
        gridHeight: 20,
        
        init: function() {
            this.canvas = document.getElementById('snake-canvas');
            this.ctx = this.canvas.getContext('2d');
            
            // Load high score from localStorage
            this.highScore = localStorage.getItem('snakeHighScore') || 0;
            document.getElementById('snake-high-score').textContent = this.highScore;
            
            this.setupEventListeners();
            this.resetGame();
            this.draw();
        },
        
        setupEventListeners: function() {
            // Game control buttons
            document.getElementById('snake-start').addEventListener('click', () => {
                PortfolioOS.playSound('game');
                this.startGame();
            });
            
            document.getElementById('snake-pause').addEventListener('click', () => {
                PortfolioOS.playSound('click');
                this.togglePause();
            });
            
            document.getElementById('snake-reset').addEventListener('click', () => {
                PortfolioOS.playSound('click');
                this.resetGame();
            });
            
            // Direction control buttons
            document.getElementById('snake-up').addEventListener('click', () => {
                PortfolioOS.playSound('click');
                if (this.direction !== 'down') this.nextDirection = 'up';
            });
            
            document.getElementById('snake-down').addEventListener('click', () => {
                PortfolioOS.playSound('click');
                if (this.direction !== 'up') this.nextDirection = 'down';
            });
            
            document.getElementById('snake-left').addEventListener('click', () => {
                PortfolioOS.playSound('click');
                if (this.direction !== 'right') this.nextDirection = 'left';
            });
            
            document.getElementById('snake-right').addEventListener('click', () => {
                PortfolioOS.playSound('click');
                if (this.direction !== 'left') this.nextDirection = 'right';
            });
            
            // Keyboard controls
            document.addEventListener('keydown', (e) => {
                if (!this.isRunning || this.isPaused) return;
                
                switch(e.key) {
                    case 'ArrowUp':
                        PortfolioOS.playSound('click');
                        if (this.direction !== 'down') this.nextDirection = 'up';
                        break;
                    case 'ArrowDown':
                        PortfolioOS.playSound('click');
                        if (this.direction !== 'up') this.nextDirection = 'down';
                        break;
                    case 'ArrowLeft':
                        PortfolioOS.playSound('click');
                        if (this.direction !== 'right') this.nextDirection = 'left';
                        break;
                    case 'ArrowRight':
                        PortfolioOS.playSound('click');
                        if (this.direction !== 'left') this.nextDirection = 'right';
                        break;
                }
            });
            
            // Touch controls for mobile
            let touchStartX = 0;
            let touchStartY = 0;
            
            this.canvas.addEventListener('touchstart', (e) => {
                if (!this.isRunning || this.isPaused) return;
                
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                e.preventDefault();
            });
            
            this.canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
            });
            
            this.canvas.addEventListener('touchend', (e) => {
                if (!this.isRunning || this.isPaused) return;
                
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                
                const dx = touchEndX - touchStartX;
                const dy = touchEndY - touchStartY;
                
                // Determine swipe direction
                if (Math.abs(dx) > Math.abs(dy)) {
                    // Horizontal swipe
                    if (dx > 0 && this.direction !== 'left') {
                        this.nextDirection = 'right';
                    } else if (dx < 0 && this.direction !== 'right') {
                        this.nextDirection = 'left';
                    }
                } else {
                    // Vertical swipe
                    if (dy > 0 && this.direction !== 'up') {
                        this.nextDirection = 'down';
                    } else if (dy < 0 && this.direction !== 'down') {
                        this.nextDirection = 'up';
                    }
                }
                
                e.preventDefault();
            });
        },
        
        startGame: function() {
            if (this.isRunning && !this.isPaused) return;
            
            if (!this.isRunning) {
                this.resetGame();
            }
            
            this.isRunning = true;
            this.isPaused = false;
            document.getElementById('snake-start').textContent = 'Restart';
            document.getElementById('snake-pause').textContent = 'Pause';
            
            if (this.gameLoop) {
                clearInterval(this.gameLoop);
            }
            
            this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
        },
        
        togglePause: function() {
            if (!this.isRunning) return;
            
            this.isPaused = !this.isPaused;
            document.getElementById('snake-pause').textContent = this.isPaused ? 'Resume' : 'Pause';
            
            if (this.isPaused) {
                clearInterval(this.gameLoop);
            } else {
                this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
            }
        },
        
        stopGame: function() {
            this.isRunning = false;
            this.isPaused = false;
            if (this.gameLoop) {
                clearInterval(this.gameLoop);
                this.gameLoop = null;
            }
            document.getElementById('snake-start').textContent = 'Start Game';
            document.getElementById('snake-pause').textContent = 'Pause';
        },
        
        resetGame: function() {
            this.stopGame();
            
            // Reset snake
            this.snake = [
                { x: 10, y: 10 },
                { x: 9, y: 10 },
                { x: 8, y: 10 }
            ];
            
            this.direction = 'right';
            this.nextDirection = 'right';
            this.score = 0;
            this.level = 1;
            this.gameSpeed = 150;
            
            // Generate initial food
            this.generateFood();
            
            // Update UI
            document.getElementById('snake-score').textContent = this.score;
            document.getElementById('snake-level').textContent = this.level;
            document.getElementById('snake-high-score').textContent = this.highScore;
            
            // Redraw
            this.draw();
        },
        
        generateFood: function() {
            let foodOnSnake;
            do {
                foodOnSnake = false;
                this.food = {
                    x: Math.floor(Math.random() * this.gridWidth),
                    y: Math.floor(Math.random() * this.gridHeight)
                };
                
                // Check if food is on snake
                for (let segment of this.snake) {
                    if (segment.x === this.food.x && segment.y === this.food.y) {
                        foodOnSnake = true;
                        break;
                    }
                }
            } while (foodOnSnake);
        },
        
        update: function() {
            // Update direction
            this.direction = this.nextDirection;
            
            // Calculate new head position
            const head = { ...this.snake[0] };
            
            switch(this.direction) {
                case 'up': head.y--; break;
                case 'down': head.y++; break;
                case 'left': head.x--; break;
                case 'right': head.x++; break;
            }
            
            // Check wall collision
            if (head.x < 0 || head.x >= this.gridWidth || head.y < 0 || head.y >= this.gridHeight) {
                this.gameOver();
                return;
            }
            
            // Check self collision
            for (let segment of this.snake) {
                if (segment.x === head.x && segment.y === head.y) {
                    this.gameOver();
                    return;
                }
            }
            
            // Add new head
            this.snake.unshift(head);
            
            // Check food collision
            if (head.x === this.food.x && head.y === this.food.y) {
                // Play sound
                PortfolioOS.playSound('game');
                
                // Increase score
                this.score += 10;
                
                // Update high score
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    localStorage.setItem('snakeHighScore', this.highScore);
                }
                
                // Level up every 50 points
                if (this.score % 50 === 0) {
                    this.level++;
                    this.gameSpeed = Math.max(50, this.gameSpeed - 20); // Speed up
                    PortfolioOS.playSound('themeChange');
                }
                
                // Generate new food
                this.generateFood();
                
                // Update UI
                document.getElementById('snake-score').textContent = this.score;
                document.getElementById('snake-high-score').textContent = this.highScore;
                document.getElementById('snake-level').textContent = this.level;
            } else {
                // Remove tail if no food eaten
                this.snake.pop();
            }
            
            // Redraw
            this.draw();
        },
        
        draw: function() {
            // Clear canvas
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw grid
            this.ctx.strokeStyle = '#222';
            this.ctx.lineWidth = 0.5;
            
            for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, this.canvas.height);
                this.ctx.stroke();
            }
            
            for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.canvas.width, y);
                this.ctx.stroke();
            }
            
            // Draw snake
            for (let i = 0; i < this.snake.length; i++) {
                const segment = this.snake[i];
                
                // Head is different color
                if (i === 0) {
                    this.ctx.fillStyle = '#0a0';
                } else {
                    this.ctx.fillStyle = '#0f0';
                }
                
                this.ctx.fillRect(
                    segment.x * this.gridSize + 1,
                    segment.y * this.gridSize + 1,
                    this.gridSize - 2,
                    this.gridSize - 2
                );
                
                // Add border to segments
                this.ctx.strokeStyle = '#000';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(
                    segment.x * this.gridSize + 1,
                    segment.y * this.gridSize + 1,
                    this.gridSize - 2,
                    this.gridSize - 2
                );
            }
            
            // Draw food
            this.ctx.fillStyle = '#f00';
            this.ctx.beginPath();
            this.ctx.arc(
                this.food.x * this.gridSize + this.gridSize / 2,
                this.food.y * this.gridSize + this.gridSize / 2,
                this.gridSize / 2 - 2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            
            // Draw score on canvas
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '12px "Share Tech Mono"';
            this.ctx.fillText(`Score: ${this.score}`, 5, 15);
            this.ctx.fillText(`Level: ${this.level}`, 5, 30);
            
            // Draw game over if needed
            if (!this.isRunning && this.score > 0) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '24px "Share Tech Mono"';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);
                
                this.ctx.font = '16px "Share Tech Mono"';
                this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
                this.ctx.fillText(`High Score: ${this.highScore}`, this.canvas.width / 2, this.canvas.height / 2 + 30);
            }
            
            // Draw paused text
            if (this.isPaused) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '24px "Share Tech Mono"';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
            }
        },
        
        gameOver: function() {
            PortfolioOS.playSound('error');
            this.stopGame();
            this.draw();
            
            // Show game over message
            setTimeout(() => {
                PortfolioOS.showError(`Game Over! Final Score: ${this.score}. High Score: ${this.highScore}`, 'Snake Game');
            }, 500);
        }
    };
    
    // Initialize the OS
    PortfolioOS.init();
    PortfolioOS.loadSavedTheme();
});
