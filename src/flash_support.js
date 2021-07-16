const path = require('path');
const flashLoader = require('flash-player-loader');

flashLoader.addSource(path.join(__dirname, '..', 'flash', ));
flashLoader.load();
// let pluginName;
// switch (process.platform) {
//     case 'win32':
//         pluginName = 'pepflashplayer.dll';
//         // pluginName = 'pepflashplayer64_31_0_0_122.dll';
//         break;
//     case 'darwin':
//         pluginName = 'PepperFlashPlayer.plugin';
//         break;
//     case 'linux':
//         pluginName = 'libpepflashplayer.so';
//         break;
// }
//
// function append_flash_path(app) {
//     app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, '..', 'flash', pluginName));
// }
//

function append_flash_path(app) {

}

module.exports = append_flash_path;