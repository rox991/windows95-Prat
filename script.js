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
        
        // Audio elements
        audio: {
            startup: null,
            click: null,
            error: null,
            windowOpen: null,
            windowClose: null
        },
        
        // Initialize the OS
        init: function() {
            this.cacheElements();
            this.bindEvents();
            this.initClock();
            this.startBootSequence();
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
            
            // Cache audio elements
            this.audio.startup = document.getElementById('startup-sound');
            this.audio.click = document.getElementById('click-sound');
            this.audio.error = document.getElementById('error-sound');
            this.audio.windowOpen = document.getElementById('window-open-sound');
            this.audio.windowClose = document.getElementById('window-close-sound');
            
            // Cache desktop icons
            this.desktopIcons = document.querySelectorAll('.desktop-icon');
        },
        
        // Bind event listeners
        bindEvents: function() {
            // Start button
            this.elements.startButton.addEventListener('click', (e) => {
                this.toggleStartMenu();
                e.stopPropagation();
            });
            
            // Start menu items
            document.querySelectorAll('.menu-item[data-app]').forEach(item => {
                item.addEventListener('click', (e) => {
                    const app = item.getAttribute('data-app');
                    this.openApp(app);
                    this.closeStartMenu();
                    e.stopPropagation();
                });
            });
            
            // Desktop icons
            this.desktopIcons.forEach(icon => {
                icon.addEventListener('dblclick', (e) => {
                    const app = icon.getAttribute('data-app');
                    this.openApp(app);
                    this.playSound('click');
                });
                
                icon.addEventListener('click', (e) => {
                    this.clearIconSelection();
                    icon.classList.add('selected');
                });
            });
            
            // Context menu
            document.addEventListener('contextmenu', (e) => {
                if (e.target.closest('.desktop')) {
                    e.preventDefault();
                    this.showContextMenu(e.clientX, e.clientY);
                }
            });
            
            document.addEventListener('click', () => {
                this.hideContextMenu();
                this.clearIconSelection();
            });
            
            // Context menu items
            document.getElementById('context-refresh').addEventListener('click', () => {
                this.showError('This feature is not implemented in this demo.', 'Information');
                this.hideContextMenu();
            });
            
            document.getElementById('context-properties').addEventListener('click', () => {
                this.showError('Properties dialog is not available.', 'Information');
                this.hideContextMenu();
            });
            
            // Settings
            document.getElementById('theme-toggle').addEventListener('click', () => {
                this.toggleCRTEffect();
            });
            
            document.getElementById('sound-toggle').addEventListener('click', () => {
                this.toggleSound();
                const soundText = document.querySelector('#sound-toggle span');
                soundText.textContent = `Sound: ${this.soundEnabled ? 'ON' : 'OFF'}`;
            });
            
            // Shutdown
            document.getElementById('menu-shutdown').addEventListener('click', () => {
                this.shutdown();
            });
            
            // CRT toggle
            document.getElementById('crt-toggle').addEventListener('click', () => {
                this.toggleCRTEffect();
            });
            
            // Error dialog OK button
            document.getElementById('error-ok').addEventListener('click', () => {
                this.hideError();
            });
            
            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                // Alt+Tab - Cycle through windows
                if (e.altKey && e.key === 'Tab') {
                    e.preventDefault();
                    this.cycleWindows();
                }
                
                // Escape - Close start menu or active window
                if (e.key === 'Escape') {
                    if (this.isStartMenuOpen) {
                        this.closeStartMenu();
                    } else if (this.activeWindow) {
                        this.closeWindow(this.activeWindow.id);
                    }
                }
                
                // F11 - Toggle CRT
                if (e.key === 'F11') {
                    e.preventDefault();
                    this.toggleCRTEffect();
                }
            });
            
            // Window dragging
            document.addEventListener('mousedown', this.handleWindowDragStart.bind(this));
            document.addEventListener('mousemove', this.handleWindowDrag.bind(this));
            document.addEventListener('mouseup', this.handleWindowDragEnd.bind(this));
            
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
            
            // Play startup sound if enabled
            if (this.soundEnabled) {
                this.audio.startup.volume = 0.5;
                this.audio.startup.play().catch(e => console.log("Audio play failed:", e));
            }
            
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
            this.playSound('click');
            
            if (this.isStartMenuOpen) {
                this.closeStartMenu();
            } else {
                this.openStartMenu();
            }
        },
        
        openStartMenu: function() {
            this.elements.startMenu.classList.add('active');
            this.elements.startButton.classList.add('active');
            this.isStartMenuOpen = true;
        },
        
        closeStartMenu: function() {
            this.elements.startMenu.classList.remove('active');
            this.elements.startButton.classList.remove('active');
            this.isStartMenuOpen = false;
        },
        
        // Open application
        openApp: function(appId) {
            this.playSound('windowOpen');
            
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
                    
                case 'notepad':
                    windowConfig = {
                        id: `window-${Date.now()}`,
                        appId: 'notepad',
                        title: 'Bio / Notes',
                        icon: 'fas fa-sticky-note',
                        width: 450,
                        height: 400,
                        content: this.getNotepadContent()
                    };
                    break;
                    
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
                    
                case 'recycle':
                    windowConfig = {
                        id: `window-${Date.now()}`,
                        appId: 'recycle',
                        title: 'Recycle Bin',
                        icon: 'fas fa-trash-alt',
                        width: 450,
                        height: 400,
                        content: this.getRecycleContent()
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
            
            // Bind notepad
            if (config.appId === 'notepad') {
                setTimeout(() => {
                    this.bindNotepad(windowEl);
                }, 100);
            }
            
            // Bind recycle bin easter egg
            if (config.appId === 'recycle') {
                setTimeout(() => {
                    document.querySelector('.easter-egg-btn').addEventListener('click', () => {
                        this.activateEasterEgg();
                    });
                }, 100);
            }
            
            // Bind resume download
            if (config.appId === 'resume') {
                setTimeout(() => {
                    document.querySelector('.download-btn').addEventListener('click', () => {
                        this.downloadResume();
                    });
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
                this.minimizeWindow(windowData.id);
            });
            
            maximizeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMaximizeWindow(windowData.id);
            });
            
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeWindow(windowData.id);
            });
            
            header.addEventListener('click', () => {
                this.bringToFront(windowData.id);
            });
            
            // Double-click header to maximize
            header.addEventListener('dblclick', () => {
                this.toggleMaximizeWindow(windowData.id);
            });
        },
        
        // Bring window to front
        bringToFront: function(windowId) {
            const windowData = this.windows.find(w => w.id === windowId);
            if (!windowData) return;
            
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
            this.playSound('windowClose');
            
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
                          windowData.appId === 'notepad' ? 'fas fa-sticky-note' : 
                          windowData.appId === 'resume' ? 'fas fa-file-download' : 
                          'fas fa-trash-alt'}"></i>
                <span>${windowData.title}</span>
            `;
            
            appEl.addEventListener('click', () => {
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
            
            const currentIndex = this.windows.findIndex(w => w.id === this.activeWindow.id);
            const nextIndex = (currentIndex + 1) % this.windows.length;
            
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
        
        // Show context menu
        showContextMenu: function(x, y) {
            this.playSound('click');
            
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
            this.playSound('click');
            
            if (this.crtEnabled) {
                this.showError('CRT effect enabled. Press F11 to toggle.', 'Display Settings');
            }
        },
        
        // Toggle sound
        toggleSound: function() {
            this.soundEnabled = !this.soundEnabled;
            this.playSound('click');
            
            const message = this.soundEnabled ? 
                'Sound enabled.' : 
                'Sound disabled.';
            this.showError(message, 'Audio Settings');
        },
        
        // Play sound
        playSound: function(soundName) {
            if (!this.soundEnabled || !this.audio[soundName]) return;
            
            try {
                const audio = this.audio[soundName].cloneNode();
                audio.volume = soundName === 'startup' ? 0.5 : 0.3;
                audio.play().catch(e => console.log("Sound play failed:", e));
            } catch (e) {
                console.log("Sound error:", e);
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
        
        // Shutdown sequence
        shutdown: function() {
            this.playSound('click');
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
                        <p>Hello! I'm Pratik a passionate frontend developer with a love for retro computing and creative UI/UX design.</p>
                        <p>This portfolio is built to mimic the classic Windows 95 interface while showcasing my skills in HTML, CSS, and JavaScript.</p>
                        <p>I specialize in creating interactive, visually appealing web applications with attention to detail and user experience.</p>
                    </div>
                </div>
                <div style="margin-top: 20px;">
                    <h4>Contact Information</h4>
                    <p><strong>Email:</strong> roypratik1554@gmail.com</p>
                    <p><strong>Location:</strong> Digital World</p>
                    <p><strong>Status:</strong> Available for projects</p>
                </div>
            `;
        },
        
        getProjectsContent: function() {
            return `
                <h3>My Projects</h3>
                <p>Here are some of my recent projects. Click on any project for more details.</p>
                <div class="project-grid">
                    <div class="project-card">
                        <h4>Retro Game Collection</h4>
                        <p>A collection of classic games rebuilt with modern JavaScript.</p>
                    </div>
                    <div class="project-card">
                        <h4>Interactive Data Dashboard</h4>
                        <p>Real-time data visualization with D3.js and custom UI components.</p>
                    </div>
                    <div class="project-card">
                        <h4>E-commerce Platform</h4>
                        <p>Full-featured online store with cart, checkout, and user accounts.</p>
                    </div>
                    <div class="project-card">
                        <h4>Music Player Web App</h4>
                        <p>Custom audio player with visualizations and playlist management.</p>
                    </div>
                    <div class="project-card">
                        <h4>Portfolio OS (This!)</h4>
                        <p>A Windows 95-themed portfolio built with vanilla JavaScript.</p>
                    </div>
                    <div class="project-card">
                        <h4>API Integration Toolkit</h4>
                        <p>Modular library for connecting to various third-party APIs.</p>
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
                            <span class="skill-name">React</span>
                            <span class="skill-percent">80%</span>
                        </div>
                        <div class="skill-bar">
                            <div class="skill-progress" data-percent="80"></div>
                        </div>
                    </div>
                    <div class="skill-item">
                        <div class="skill-header">
                            <span class="skill-name">Node.js</span>
                            <span class="skill-percent">75%</span>
                        </div>
                        <div class="skill-bar">
                            <div class="skill-progress" data-percent="75"></div>
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
        
        getNotepadContent: function() {
            return `
                <h3>Bio / Notes</h3>
                <p>Personal notes and thoughts:</p>
                <textarea class="notepad-content" id="notepad-text">
Hello and welcome to my portfolio!

This is a simulation of Windows 95 built entirely with HTML, CSS, and vanilla JavaScript.

ABOUT ME:
- Frontend Developer with 5+ years experience
- Passionate about creative UI/UX
- Love for retro computing and classic interfaces
- Strong focus on performance and accessibility

CURRENT PROJECTS:
1. This Windows 95 Portfolio
2. Retro Game Engine
3. CSS Framework for nostalgic UIs

SKILLS:
• HTML5, CSS3, JavaScript (ES6+)
• React, Vue.js, Svelte
• Node.js, Express
• UI/UX Design, Figma
• Git, Webpack, CI/CD

CONTACT:
Feel free to explore all the apps and features!
Double-click icons or use the Start menu.

- Portfolio Owner
                </textarea>
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
                        <li>Professional Summary</li>
                        <li>Work Experience</li>
                        <li>Education & Certifications</li>
                        <li>Technical Skills</li>
                        <li>Project Portfolio</li>
                        <li>References</li>
                    </ul>
                    <button class="download-btn">Download Resume (PDF)</button>
                </div>
            `;
        },
        
        getRecycleContent: function() {
            return `
                <div class="recycle-content">
                    <div class="recycle-icon">
                        <i class="fas fa-trash-alt"></i>
                    </div>
                    <h3>Recycle Bin</h3>
                    <p>The Recycle Bin contains deleted items from your portfolio.</p>
                    <p>Currently empty. But wait... there's something special here!</p>
                    <p>Click the button below for a fun Easter egg!</p>
                    <button class="easter-egg-btn">Discover Easter Egg</button>
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
        },
        
        // Bind notepad
        bindNotepad: function(windowEl) {
            const textarea = windowEl.querySelector('#notepad-text');
            
            // Auto-save to localStorage
            textarea.addEventListener('input', () => {
                localStorage.setItem('portfolioNotepad', textarea.value);
            });
            
            // Load saved content
            const savedContent = localStorage.getItem('portfolioNotepad');
            if (savedContent) {
                textarea.value = savedContent;
            }
        },
        
        // Activate Easter egg
        activateEasterEgg: function() {
            this.playSound('click');
            
            // Create fun visual effect
            const colors = ['#000080', '#008080', '#800080', '#808000', '#008000'];
            let flashes = 0;
            
            const flashInterval = setInterval(() => {
                document.body.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                flashes++;
                
                if (flashes >= 10) {
                    clearInterval(flashInterval);
                    document.body.style.backgroundColor = '#008080';
                    
                    // Show special message
                    this.showError('Congratulations! You found the Easter egg! 🥚', 'Easter Egg Found!');
                    
                    // Open a secret window
                    setTimeout(() => {
                        this.openApp('about');
                    }, 1000);
                }
            }, 150);
        },
        
        // Download resume
        downloadResume: function() {
            this.playSound('click');
            
            // Create a fake download
            this.showError('Resume downloaded successfully! (This is a demo - in a real app, this would download a PDF)', 'Download Complete');
            
            // In a real application, this would trigger an actual file download
            // For demo purposes, we just show a message
        }
    };
    
    // Initialize the OS
    PortfolioOS.init();
});