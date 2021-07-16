const { app, BrowserWindow, shell, session } = require('electron');
const windowStateKeeper = require('electron-window-state');
const { FB } = require('fb');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const append_flash_path = require('./flash_support');
append_flash_path(app);

let mainWindow;

const createWindow = () => {

    // session.defaultSession.clearStorageData([], (data) => {});

    let mainWindowState = windowStateKeeper({
        defaultWidth: 1000,
        defaultHeight: 700
    });

    mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        autoHideMenuBar: true,
        darkTheme: true,
        icon: 'icon.png',
        webPreferences: {
            nodeIntegration: false, // https://github.com/electron/electron/issues/254#issuecomment-183483641
            plugins: true, // for flash
            webSecurity: false,
        }
    });

    mainWindowState.manage(mainWindow);

    mainWindow.loadURL('https://www.supermechs.com/?hideall');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
        event.preventDefault();

        let urllower = url.toLowerCase();
        if (
            (urllower.includes('https://www.facebook.com/') && urllower.includes('dialog/oauth'))
        ) {
            // Should not open them in a browser
        } else {
            if (shell.openExternal(url)) {
                return;
            }
        }
        Object.assign(options, {
            parent: mainWindow,

            webPreferences: {
                nodeIntegration: false,
                webSecurity: false,
                plugins: true,
            }
        });
        let redirectWindow = new BrowserWindow(options);

        // Handling facebook login this way
        if (urllower.includes('https://www.facebook.com/') && urllower.includes('dialog/oauth')) {
            redirectWindow.webContents.on('did-navigate', function(event, newUrl) {
                let raw_code = /access_token=([^&]*)/.exec(newUrl) || null;
                let access_token = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
                let error = /\?error=(.+)$/.exec(newUrl);
                if (access_token) {
                    FB.setAccessToken(access_token);
                    FB.api('/me', { fields: ['id'] }, function(resp) {
                        let response = {
                            status: 'connected',
                            authResponse: {
                                accessToken: access_token,
                                userID: resp.id
                            }
                        };
                        const responseRaw = JSON.stringify(response);
                        mainWindow.webContents.executeJavaScript(`
                    var swfObject = document.getElementById(FBAS.swfObjectID);
                    swfObject.sm_handleAuthResponseChange(${responseRaw});
                `);
                        redirectWindow.hide();
                        setTimeout(function() {
                            redirectWindow.close()
                        }, 10000);
                    });
                }
            });
            const redirect = 'https://www.facebook.com/connect/login_success.html';
            const FB_APP_ID = "118103108359595";
            redirectWindow.loadURL(`https://www.facebook.com/v2.10/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${redirect}&response_type=token`)
        } else {
            redirectWindow.loadURL(url)
        }

        event.newGuest = redirectWindow
    })

};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});