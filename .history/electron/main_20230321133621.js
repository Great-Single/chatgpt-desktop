const { app, BrowserWindow, Menu, Tray } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;
const trayIcon = path.join(__dirname, 'icon.ico');
let showWindowMenuItem = null;

app.on('ready', () => {
    // 创建主窗口
    mainWindow = new BrowserWindow({
        width: 1024, height: 768,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // 菜单模板
    const template = [
        {
            label: '文件',
            submenu: [
                {
                    label: '新建窗口',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        createWindow()
                    }
                },
                { type: 'separator' },
                { label: '关闭程序', click: quitApp }
            ]
        },
        {
            label: '编辑',
            submenu: [
                { role: 'undo', label: '撤销' },
                { role: 'redo', label: '重做' },
                { type: 'separator' },
                { role: 'cut', label: '剪切' },
                { role: 'copy', label: '复制' },
                { role: 'paste', label: '粘贴' },
                { role: 'delete', label: '删除' },
                { role: 'selectall', label: '全选' },
            ]
        },
        {
            label: '视图',
            submenu: [
                { role: 'reload', label: '重新加载' },
                { role: 'forcereload', label: '强制重新加载' },
                { role: 'toggledevtools', label: '切换开发者工具' },
                { type: 'separator' },
                { role: 'resetzoom', label: '重置缩放' },
                { role: 'zoomin', label: '放大' },
                { role: 'zoomout', label: '缩小' },
                { type: 'separator' },
                { role: 'togglefullscreen', label: '切换全屏模式' }
            ]
        },
        {
            label: '窗口',
            submenu: [
                { role: 'minimize', label: '最小化' },
                { role: 'close', label: '关闭' }
            ]
        },
        {
            label: '关于',
            submenu: [
                {
                    label: '关于 ChatGPT Desktop',
                    click: () => {
                        const aboutWindow = new BrowserWindow({
                            width: 400,
                            height: 300,
                            resizable: false,
                            title: '关于 ChatGPT Desktop',
                            parent: mainWindow,
                            modal: true,
                            show: false,
                            webPreferences: {
                                nodeIntegration: true,
                                contextIsolation: false
                            }
                        })
                        aboutWindow.loadFile('public/about.html')
                        aboutWindow.once('ready-to-show', () => {
                            aboutWindow.show()
                        })
                    }
                }
            ]
        }
    ];

    // 初始化菜单
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    // 初始化托盘
    tray = new Tray(trayIcon);
    const trayMenu = Menu.buildFromTemplate([
        {
            label: '显示主窗口',
            id: 'show-window',
            enabled: true,
            click() {
                mainWindow.show();
            }
        },
        {
            label: '退出',
            click: quitApp // 关闭整个应用
        }
    ]);
    tray.setContextMenu(trayMenu);

    // 保存需要操作的菜单项的引用
    showWindowMenuItem = trayMenu.getMenuItemById('show-window');

    // 加载页面文件
    mainWindow.loadURL('https://chat.openai.com/chat');

    // 关闭窗口至托盘
    mainWindow.on('close', ev => {
        // 阻止窗口关闭
        ev.preventDefault();
        mainWindow.hide();
    });

    tray.setToolTip('这是一个托盘提示')

    // 托盘图标被双击
    tray.on('double-click', () => {
        mainWindow.show();
    });

    // 窗口隐藏
    mainWindow.on('hide', () => {
        showWindowMenuItem.enabled = true;
        tray.setContextMenu(trayMenu);
    });

    // 窗口显示
    mainWindow.on('show', () => {
        showWindowMenuItem.enabled = false;
        tray.setContextMenu(trayMenu);
    });
});

// 创建新窗口
function createWindow() {
    const newWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    newWindow.loadURL('https://chat.openai.com/chat');
}

// 关闭应用程序的函数
function quitApp() {
    const windows = BrowserWindow.getAllWindows()
    windows.forEach(window => {
        window.removeAllListeners('close')
        window.close()
    })
    app.exit()
}