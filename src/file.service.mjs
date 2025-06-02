import fs from "fs";
import path from "path";

// The boilerplate is because y copy-pasted the code
export class FileService {
  async getFiles(dirPath) {
    try {
      const files = await fs.promises.readdir(dirPath);
      return files;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getFile(filePath) {
    try {
      const file = await fs.promises.readFile(filePath, { encoding: "utf8" });
      return file;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async readFilesContent(folderPath, files) {
    const fileContents = [];
    for (const file of files) {
      const data = await fs.promises.readFile(`${folderPath}/${file}`, {
        encoding: "utf8",
      });
      fileContents.push(data);
    }
    return fileContents;
  }

  async moveFile({ originFilePath, destinationFolderPath }) {
    try {
      await fs.promises.rename(
        originFilePath,
        `${destinationFolderPath}/${path.basename(originFilePath)}`
      );
      console.log(`File ${originFilePath} moved to ${destinationFolderPath}`);
    } catch (error) {
      console.error(`Error moving file ${originFilePath}:`, error);
      throw error;
    }
  }

  async createFile({ filename, content }) {
    try {
      const currentDirectory = process.cwd();
      await fs.promises.writeFile(`${currentDirectory}/${filename}`, content);
      console.log(`File ${filename} created.`);
    } catch (error) {
      console.error(`Error creating file ${filename}:`, error);
      throw error;
    }
  }

  async createDirectory({ dirPath }) {
    try {
      await fs.promises.mkdir(dirPath);
      console.log(`Directory ${dirPath} created.`);
    } catch (error) {
      console.error(`Error creating directory ${dirPath}:`, error);
      throw error;
    }
  }

  async fileExists(filePath) {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch (error) {
      if (error.code === "ENOENT") {
        return false;
      }
      console.error(`Error checking if file ${filePath} exists:`, error);
      throw error;
    }
  }

  async directoryExists(dirPath) {
    try {
      await fs.promises.access(dirPath);
      return true;
    } catch (error) {
      if (error.code === "ENOENT") {
        return false;
      }
      console.error(`Error checking if directory ${dirPath} exists:`, error);
      throw error;
    }
  }

  //Get file by last modified date
  async getLastModifiedFile(dirPath) {
    try {
      const files = await fs.promises.readdir(dirPath);
      const fileStats = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(dirPath, file);
          const stats = await fs.promises.stat(filePath);
          return { file, mtime: stats.mtime };
        })
      );
      const lastModifiedFile = fileStats.reduce((latest, current) => {
        return latest.mtime > current.mtime ? latest : current;
      });
      return lastModifiedFile.file;
    } catch (error) {
      console.error(`Error getting last modified file in ${dirPath}:`, error);
      throw error;
    }
  }

  async renameFile(oldPath, newPath) {
    try {
      await fs.promises.rename(oldPath, newPath);
      console.log(`File renamed from ${oldPath} to ${newPath}`);
    } catch (error) {
      console.error(
        `Error renaming file from ${oldPath} to ${newPath}:`,
        error
      );
      throw error;
    }
  }

  // Get file that starts with "20388799340_" and be the last modified file
  async getLastModifiedFileByPrefix(dirPath, prefix) {
    try {
      const files = await fs.promises.readdir(dirPath);
      const filteredFiles = files.filter((file) => file.startsWith(prefix));
      const fileStats = await Promise.all(
        filteredFiles.map(async (file) => {
          const filePath = path.join(dirPath, file);
          const stats = await fs.promises.stat(filePath);
          return { file, mtime: stats.mtime };
        })
      );
      const lastModifiedFile = fileStats.reduce((latest, current) => {
        return latest.mtime > current.mtime ? latest : current;
      });
      return lastModifiedFile.file;
    } catch (error) {
      console.error(
        `Error getting last modified file with prefix ${prefix} in ${dirPath}:`,
        error
      );
      throw error;
    }
  }
}
