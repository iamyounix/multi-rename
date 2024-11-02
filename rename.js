const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Main menu display
function mainMenu() {
  console.clear();
  console.log('==========================');
  console.log('        Welcome Users     ');
  console.log('==========================');
  console.log('Please select an option:');
  console.log('1. Rename single/multiple Files');
  console.log('2. Rename single/multiple Folders');
  console.log('3. Exit');

  rl.question('Enter your choice (1, 2, or 3): ', (choice) => {
    switch (choice) {
      case '1':
        renameFiles();
        break;
      case '2':
        renameFolders();
        break;
      case '3':
        console.log('Exiting the application. Goodbye!');
        rl.close();
        break;
      default:
        console.log('Invalid choice. Please try again.');
        mainMenu();
    }
  });
}

// File renaming functions
function renameFiles() {
  getDir('files')
    .then(dirPath => {
      console.log('Choose renaming option:');
      console.log('1. Manual rename');
      console.log('2. Random rename');
      rl.question('Enter your choice (1 or 2): ', (option) => {
        if (option === '1') {
          manualRenameFiles(dirPath);
        } else if (option === '2') {
          randomRenameFiles(dirPath);
        } else {
          console.log('Invalid choice. Returning to main menu.');
          mainMenu();
        }
      });
    })
    .catch(err => console.error(err));
}

function manualRenameFiles(dirPath) {
  listItems(dirPath, false);
  getRenameParams()
    .then(({ findText, replaceText }) => {
      fs.readdir(dirPath, (err, files) => {
        if (err) throw err;
        files.forEach(file => {
          const oldPath = path.join(dirPath, file);
          const newFileName = file.replace(findText, replaceText);
          if (newFileName !== file) {
            const newPath = path.join(dirPath, newFileName);
            fs.rename(oldPath, newPath, err => {
              if (err) throw err;
              console.log(`Renamed: ${file} to ${newFileName}`);
            });
          }
        });
        console.log('Files renamed successfully.');
        rl.question('Press Enter to return to the menu...', () => mainMenu());
      });
    });
}

function randomRenameFiles(dirPath) {
  fs.readdir(dirPath, (err, files) => {
    if (err) throw err;
    files.forEach((file, index) => {
      const oldPath = path.join(dirPath, file);
      const newFileName = `file_${index + 1}${path.extname(file)}`;
      const newPath = path.join(dirPath, newFileName);
      fs.rename(oldPath, newPath, err => {
        if (err) throw err;
        console.log(`Renamed: ${file} to ${newFileName}`);
      });
    });
    console.log('Files renamed randomly.');
    rl.question('Press Enter to return to the menu...', () => mainMenu());
  });
}

// Folder renaming functions
function renameFolders() {
  getDir('folders')
    .then(dirPath => {
      console.log('Choose renaming option:');
      console.log('1. Manual rename');
      console.log('2. Random rename');
      rl.question('Enter your choice (1 or 2): ', (option) => {
        if (option === '1') {
          manualRenameFolders(dirPath);
        } else if (option === '2') {
          randomRenameFolders(dirPath);
        } else {
          console.log('Invalid choice. Returning to main menu.');
          mainMenu();
        }
      });
    })
    .catch(err => console.error(err));
}

function manualRenameFolders(dirPath) {
  listItems(dirPath, true);
  getRenameParams()
    .then(({ findText, replaceText }) => {
      fs.readdir(dirPath, { withFileTypes: true }, (err, items) => {
        if (err) throw err;
        items.forEach(item => {
          if (item.isDirectory()) {
            const oldPath = path.join(dirPath, item.name);
            const newFolderName = item.name.replace(findText, replaceText);
            if (newFolderName !== item.name) {
              const newPath = path.join(dirPath, newFolderName);
              fs.rename(oldPath, newPath, err => {
                if (err) throw err;
                console.log(`Renamed: ${item.name} to ${newFolderName}`);
              });
            }
          }
        });
        console.log('Folders renamed successfully.');
        rl.question('Press Enter to return to the menu...', () => mainMenu());
      });
    });
}

function randomRenameFolders(dirPath) {
  fs.readdir(dirPath, { withFileTypes: true }, (err, items) => {
    if (err) throw err;
    items.forEach((item, index) => {
      if (item.isDirectory()) {
        const oldPath = path.join(dirPath, item.name);
        const newFolderName = `folder_${index + 1}`;
        const newPath = path.join(dirPath, newFolderName);
        fs.rename(oldPath, newPath, err => {
          if (err) throw err;
          console.log(`Renamed: ${item.name} to ${newFolderName}`);
        });
      }
    });
    console.log('Folders renamed randomly.');
    rl.question('Press Enter to return to the menu...', () => mainMenu());
  });
}

// Helper functions
function getDir(type) {
  return new Promise((resolve, reject) => {
    console.log(`\nEnter the full path of the directory containing the ${type} you want to rename:`);
    rl.question('Directory Path: ', (dirPath) => {
      dirPath = dirPath.trim().replace(/^['"]|['"]$/g, '');

      fs.access(dirPath, fs.constants.F_OK, (err) => {
        if (err) {
          console.log('Directory does not exist. Please try again.');
          reject(err);
        } else {
          resolve(dirPath);
        }
      });
    });
  });
}

function listItems(dirPath, isFolder) {
  console.log(`\n${isFolder ? 'Folders' : 'Files'} in the directory:`);
  fs.readdir(dirPath, { withFileTypes: true }, (err, items) => {
    if (err) throw err;
    items.forEach(item => {
      if (isFolder && item.isDirectory()) {
        console.log(`+ ${item.name}`);
      } else if (!isFolder && item.isFile()) {
        console.log(`+ ${item.name}`);
      }
    });
  });
}

function getRenameParams() {
  return new Promise((resolve) => {
    rl.question('Enter the part of the name to find: ', (findText) => {
      rl.question('Enter the text to replace with: ', (replaceText) => {
        resolve({ findText, replaceText });
      });
    });
  });
}

// Start the application
mainMenu();

