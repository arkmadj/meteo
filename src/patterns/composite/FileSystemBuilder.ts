/**
 * Builder and Utility Functions for File System Composite Pattern
 * 
 * Provides convenient methods for creating and manipulating file system structures
 */

import { Directory, File, FileSystemComponent } from './FileSystemComponent';

/**
 * FileSystemBuilder - Fluent API for building file system structures
 */
export class FileSystemBuilder {
  private root: Directory;

  constructor(rootName: string = 'root') {
    this.root = new Directory(rootName, `/${rootName}`);
  }

  /**
   * Get the root directory
   */
  public getRoot(): Directory {
    return this.root;
  }

  /**
   * Add a file to a specific path
   * @param path - Path where to add the file (e.g., '/root/folder1')
   * @param fileName - Name of the file
   * @param content - File content
   */
  public addFile(path: string, fileName: string, content: string = ''): this {
    const directory = this.getOrCreateDirectory(path);
    const filePath = `${path}/${fileName}`;
    const file = new File(fileName, filePath, content);
    directory.add(file);
    return this;
  }

  /**
   * Add a directory to a specific path
   * @param path - Parent path (e.g., '/root')
   * @param dirName - Name of the directory
   */
  public addDirectory(path: string, dirName: string): this {
    const parentDirectory = this.getOrCreateDirectory(path);
    const dirPath = `${path}/${dirName}`;
    const directory = new Directory(dirName, dirPath);
    parentDirectory.add(directory);
    return this;
  }

  /**
   * Get or create a directory at the specified path
   */
  private getOrCreateDirectory(path: string): Directory {
    if (path === `/${this.root.getName()}` || path === '/') {
      return this.root;
    }

    const parts = path.split('/').filter(p => p !== '');
    let current: Directory = this.root;

    // Skip the root name if it's in the path
    const startIndex = parts[0] === this.root.getName() ? 1 : 0;

    for (let i = startIndex; i < parts.length; i++) {
      const part = parts[i];
      let child = current.getChild(part);

      if (!child) {
        const newPath = `/${parts.slice(0, i + 1).join('/')}`;
        const newDir = new Directory(part, newPath);
        current.add(newDir);
        child = newDir;
      }

      if (child.getType() !== 'directory') {
        throw new Error(`Path ${path} contains a file, not a directory`);
      }

      current = child as Directory;
    }

    return current;
  }

  /**
   * Build a file system from a JSON structure
   */
  public static fromJSON(json: FileSystemJSON): Directory {
    const builder = new FileSystemBuilder(json.name);
    
    if (json.children) {
      FileSystemBuilder.buildFromJSON(builder.getRoot(), json.children, `/${json.name}`);
    }
    
    return builder.getRoot();
  }

  private static buildFromJSON(
    parent: Directory,
    children: FileSystemJSON[],
    parentPath: string
  ): void {
    for (const child of children) {
      const childPath = `${parentPath}/${child.name}`;
      
      if (child.type === 'file') {
        const file = new File(child.name, childPath, child.content || '');
        parent.add(file);
      } else if (child.type === 'directory') {
        const directory = new Directory(child.name, childPath);
        parent.add(directory);
        
        if (child.children) {
          FileSystemBuilder.buildFromJSON(directory, child.children, childPath);
        }
      }
    }
  }

  /**
   * Convert a file system to JSON
   */
  public static toJSON(component: FileSystemComponent): FileSystemJSON {
    const json: FileSystemJSON = {
      name: component.getName(),
      type: component.getType(),
      path: component.getPath(),
      size: component.getSize(),
      createdAt: component.getCreatedAt().toISOString(),
      modifiedAt: component.getModifiedAt().toISOString(),
    };

    if (component.getType() === 'file') {
      const file = component as File;
      json.content = file.getContent();
      json.extension = file.getExtension();
    } else {
      const directory = component as Directory;
      json.children = directory.getChildren().map(child => FileSystemBuilder.toJSON(child));
    }

    return json;
  }
}

/**
 * JSON representation of file system structure
 */
export interface FileSystemJSON {
  name: string;
  type: 'file' | 'directory';
  path: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
  content?: string;
  extension?: string;
  children?: FileSystemJSON[];
}

