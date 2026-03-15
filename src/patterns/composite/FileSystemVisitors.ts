/**
 * Concrete Visitor Implementations for File System Operations
 *
 * Demonstrates the Visitor pattern integration with Composite pattern
 * to perform various operations on the file system tree.
 */

import { Directory, File, FileSystemVisitor } from './FileSystemComponent';

/**
 * Size Calculator Visitor
 * Calculates total size of all files in the tree
 */
export class SizeCalculatorVisitor implements FileSystemVisitor {
  private totalSize: number = 0;

  visitFile(file: File): void {
    this.totalSize += file.getSize();
  }

  visitDirectory(_directory: Directory): void {
    // Directory size is calculated from its children
    // No action needed here as we traverse children automatically
  }

  getTotalSize(): number {
    return this.totalSize;
  }

  reset(): void {
    this.totalSize = 0;
  }
}

/**
 * File Counter Visitor
 * Counts files and directories separately
 */
export class FileCounterVisitor implements FileSystemVisitor {
  private fileCount: number = 0;
  private directoryCount: number = 0;

  visitFile(_file: File): void {
    this.fileCount++;
  }

  visitDirectory(_directory: Directory): void {
    this.directoryCount++;
  }

  getFileCount(): number {
    return this.fileCount;
  }

  getDirectoryCount(): number {
    return this.directoryCount;
  }

  getTotalCount(): number {
    return this.fileCount + this.directoryCount;
  }

  reset(): void {
    this.fileCount = 0;
    this.directoryCount = 0;
  }
}

/**
 * Extension Filter Visitor
 * Collects all files with specific extensions
 */
export class ExtensionFilterVisitor implements FileSystemVisitor {
  private extensions: Set<string>;
  private matchedFiles: File[] = [];

  constructor(extensions: string[]) {
    this.extensions = new Set(extensions.map(ext => ext.toLowerCase()));
  }

  visitFile(file: File): void {
    if (this.extensions.has(file.getExtension().toLowerCase())) {
      this.matchedFiles.push(file);
    }
  }

  visitDirectory(_directory: Directory): void {
    // No action needed for directories
  }

  getMatchedFiles(): File[] {
    return [...this.matchedFiles];
  }

  reset(): void {
    this.matchedFiles = [];
  }
}

/**
 * Path Collector Visitor
 * Collects all paths in the tree
 */
export class PathCollectorVisitor implements FileSystemVisitor {
  private paths: string[] = [];

  visitFile(file: File): void {
    this.paths.push(file.getPath());
  }

  visitDirectory(directory: Directory): void {
    this.paths.push(directory.getPath());
  }

  getPaths(): string[] {
    return [...this.paths];
  }

  reset(): void {
    this.paths = [];
  }
}

/**
 * Content Search Visitor
 * Searches for files containing specific content
 */
export class ContentSearchVisitor implements FileSystemVisitor {
  private searchTerm: string;
  private matchedFiles: Array<{ file: File; matches: number }> = [];

  constructor(searchTerm: string) {
    this.searchTerm = searchTerm.toLowerCase();
  }

  visitFile(file: File): void {
    const content = file.getContent().toLowerCase();
    const matches = (content.match(new RegExp(this.searchTerm, 'g')) || []).length;

    if (matches > 0) {
      this.matchedFiles.push({ file, matches });
    }
  }

  visitDirectory(_directory: Directory): void {
    // No action needed for directories
  }

  getMatchedFiles(): Array<{ file: File; matches: number }> {
    return [...this.matchedFiles];
  }

  reset(): void {
    this.matchedFiles = [];
  }
}

/**
 * Tree Printer Visitor
 * Generates a formatted tree structure
 */
export class TreePrinterVisitor implements FileSystemVisitor {
  private output: string[] = [];
  private indentLevel: number = 0;

  visitFile(file: File): void {
    const indent = '  '.repeat(this.indentLevel);
    this.output.push(`${indent}📄 ${file.getName()} (${file.getSize()} bytes)`);
  }

  visitDirectory(directory: Directory): void {
    const indent = '  '.repeat(this.indentLevel);
    this.output.push(`${indent}📁 ${directory.getName()}/`);
    this.indentLevel++;

    // Children will be visited automatically
    // We need to decrease indent after all children are processed
    // This is handled by the caller
  }

  getOutput(): string {
    return this.output.join('\n');
  }

  reset(): void {
    this.output = [];
    this.indentLevel = 0;
  }

  increaseIndent(): void {
    this.indentLevel++;
  }

  decreaseIndent(): void {
    this.indentLevel = Math.max(0, this.indentLevel - 1);
  }
}

/**
 * Statistics Visitor
 * Collects comprehensive statistics about the file system
 */
export class StatisticsVisitor implements FileSystemVisitor {
  private stats = {
    totalFiles: 0,
    totalDirectories: 0,
    totalSize: 0,
    largestFile: null as File | null,
    smallestFile: null as File | null,
    extensionCounts: new Map<string, number>(),
    averageFileSize: 0,
  };

  visitFile(file: File): void {
    this.stats.totalFiles++;
    const size = file.getSize();
    this.stats.totalSize += size;

    // Track largest file
    if (!this.stats.largestFile || size > this.stats.largestFile.getSize()) {
      this.stats.largestFile = file;
    }

    // Track smallest file
    if (!this.stats.smallestFile || size < this.stats.smallestFile.getSize()) {
      this.stats.smallestFile = file;
    }

    // Count extensions
    const ext = file.getExtension() || 'no-extension';
    this.stats.extensionCounts.set(ext, (this.stats.extensionCounts.get(ext) || 0) + 1);
  }

  visitDirectory(_directory: Directory): void {
    this.stats.totalDirectories++;
  }

  getStats(): {
    totalFiles: number;
    totalDirectories: number;
    totalSize: number;
    largestFile: File | null;
    smallestFile: File | null;
    extensionCounts: Map<string, number>;
    averageFileSize: number;
  } {
    // Calculate average file size
    this.stats.averageFileSize =
      this.stats.totalFiles > 0 ? this.stats.totalSize / this.stats.totalFiles : 0;

    return { ...this.stats };
  }

  reset(): void {
    this.stats = {
      totalFiles: 0,
      totalDirectories: 0,
      totalSize: 0,
      largestFile: null,
      smallestFile: null,
      extensionCounts: new Map<string, number>(),
      averageFileSize: 0,
    };
  }
}
