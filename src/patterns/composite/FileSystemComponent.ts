/**
 * Composite Pattern Implementation for File System Structure
 *
 * The Composite pattern is a structural design pattern that lets you compose objects
 * into tree structures to represent part-whole hierarchies. It allows clients to treat
 * individual objects and compositions of objects uniformly.
 *
 * For a file system, this means:
 * - Component: Abstract interface for both files and directories
 * - Leaf: Individual files (cannot contain other components)
 * - Composite: Directories (can contain files and other directories)
 *
 * Benefits:
 * - Uniform treatment of files and directories
 * - Easy to add new component types
 * - Simplifies client code
 * - Supports recursive operations (size calculation, search, etc.)
 */

/**
 * Abstract base class for file system components
 * Defines the common interface for both files and directories
 */
export abstract class FileSystemComponent {
  protected name: string;
  protected path: string;
  protected createdAt: Date;
  protected modifiedAt: Date;

  constructor(name: string, path: string) {
    this.name = name;
    this.path = path;
    this.createdAt = new Date();
    this.modifiedAt = new Date();
  }

  /**
   * Get the name of the component
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Get the full path of the component
   */
  public getPath(): string {
    return this.path;
  }

  /**
   * Get creation timestamp
   */
  public getCreatedAt(): Date {
    return this.createdAt;
  }

  /**
   * Get last modified timestamp
   */
  public getModifiedAt(): Date {
    return this.modifiedAt;
  }

  /**
   * Update the modified timestamp
   */
  protected touch(): void {
    this.modifiedAt = new Date();
  }

  /**
   * Get the size of the component in bytes
   * Must be implemented by concrete classes
   */
  public abstract getSize(): number;

  /**
   * Get the type of the component
   */
  public abstract getType(): 'file' | 'directory';

  /**
   * Display the component (for visualization)
   * @param indent - Indentation level for nested display
   */
  public abstract display(indent?: number): string;

  /**
   * Search for components by name
   * @param searchTerm - Term to search for
   */
  public abstract search(searchTerm: string): FileSystemComponent[];

  /**
   * Get all components in the tree (including self)
   */
  public abstract getAllComponents(): FileSystemComponent[];

  /**
   * Accept a visitor (Visitor pattern integration)
   */
  public abstract accept(visitor: FileSystemVisitor): void;
}

/**
 * Visitor interface for traversing the file system
 */
export interface FileSystemVisitor {
  visitFile(file: File): void;
  visitDirectory(directory: Directory): void;
}

/**
 * File class (Leaf in Composite pattern)
 * Represents an individual file that cannot contain other components
 */
export class File extends FileSystemComponent {
  private content: string;
  private extension: string;

  constructor(name: string, path: string, content: string = '') {
    super(name, path);
    this.content = content;
    this.extension = this.extractExtension(name);
  }

  private extractExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }

  /**
   * Get file content
   */
  public getContent(): string {
    return this.content;
  }

  /**
   * Set file content
   */
  public setContent(content: string): void {
    this.content = content;
    this.touch();
  }

  /**
   * Get file extension
   */
  public getExtension(): string {
    return this.extension;
  }

  public getSize(): number {
    // Size in bytes (approximate for string content)
    return new Blob([this.content]).size;
  }

  public getType(): 'file' {
    return 'file';
  }

  public display(indent: number = 0): string {
    const spaces = ' '.repeat(indent * 2);
    return `${spaces}📄 ${this.name} (${this.getSize()} bytes)`;
  }

  public search(searchTerm: string): FileSystemComponent[] {
    return this.name.toLowerCase().includes(searchTerm.toLowerCase()) ? [this] : [];
  }

  public getAllComponents(): FileSystemComponent[] {
    return [this];
  }

  public accept(visitor: FileSystemVisitor): void {
    visitor.visitFile(this);
  }
}

/**
 * Directory class (Composite in Composite pattern)
 * Represents a directory that can contain files and other directories
 */
export class Directory extends FileSystemComponent {
  private children: FileSystemComponent[] = [];

  constructor(name: string, path: string) {
    super(name, path);
  }

  /**
   * Add a child component (file or directory)
   */
  public add(component: FileSystemComponent): void {
    this.children.push(component);
    this.touch();
  }

  /**
   * Remove a child component by name
   */
  public remove(name: string): boolean {
    const index = this.children.findIndex(child => child.getName() === name);
    if (index !== -1) {
      this.children.splice(index, 1);
      this.touch();
      return true;
    }
    return false;
  }

  /**
   * Get a child component by name
   */
  public getChild(name: string): FileSystemComponent | undefined {
    return this.children.find(child => child.getName() === name);
  }

  /**
   * Get all children
   */
  public getChildren(): FileSystemComponent[] {
    return [...this.children];
  }

  /**
   * Get the number of direct children
   */
  public getChildCount(): number {
    return this.children.length;
  }

  /**
   * Check if directory is empty
   */
  public isEmpty(): boolean {
    return this.children.length === 0;
  }

  public getSize(): number {
    // Sum of all children sizes
    return this.children.reduce((total, child) => total + child.getSize(), 0);
  }

  public getType(): 'directory' {
    return 'directory';
  }

  public display(indent: number = 0): string {
    const spaces = ' '.repeat(indent * 2);
    let result = `${spaces}📁 ${this.name}/ (${this.getSize()} bytes, ${this.children.length} items)\n`;

    for (const child of this.children) {
      result += child.display(indent + 1) + '\n';
    }

    return result.trimEnd();
  }

  public search(searchTerm: string): FileSystemComponent[] {
    const results: FileSystemComponent[] = [];

    // Check if this directory matches
    if (this.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      results.push(this);
    }

    // Search in children
    for (const child of this.children) {
      results.push(...child.search(searchTerm));
    }

    return results;
  }

  public getAllComponents(): FileSystemComponent[] {
    const components: FileSystemComponent[] = [this];

    for (const child of this.children) {
      components.push(...child.getAllComponents());
    }

    return components;
  }

  public accept(visitor: FileSystemVisitor): void {
    visitor.visitDirectory(this);

    // Visit all children
    for (const child of this.children) {
      child.accept(visitor);
    }
  }

  /**
   * Get statistics about the directory
   */
  public getStats(): {
    totalFiles: number;
    totalDirectories: number;
    totalSize: number;
    depth: number;
  } {
    let totalFiles = 0;
    let totalDirectories = 0;
    let maxDepth = 0;

    const traverse = (component: FileSystemComponent, depth: number): void => {
      if (component.getType() === 'file') {
        totalFiles++;
      } else {
        totalDirectories++;
        const dir = component as Directory;
        for (const child of dir.getChildren()) {
          traverse(child, depth + 1);
        }
      }
      maxDepth = Math.max(maxDepth, depth);
    };

    for (const child of this.children) {
      traverse(child, 1);
    }

    return {
      totalFiles,
      totalDirectories,
      totalSize: this.getSize(),
      depth: maxDepth,
    };
  }
}
