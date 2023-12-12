const fse = require('fs-extra');
const path = require('path');

// tinymce doesn't work well when bundled, so we're copying it to the public dir
// so nextjs will self-host the dependency

// use require.resolve to get path of tinymce install, since the yarn workspaces
// mean this can move around
const sourceDir = path.dirname(require.resolve('tinymce'));
const targetDir = path.join(__dirname, 'public', 'tinymce');

fse.emptyDirSync(targetDir);
fse.copySync(sourceDir, targetDir);
