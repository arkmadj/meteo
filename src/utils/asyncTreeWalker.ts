/**
 * Async Tree Walker Utility
 *
 * Provides an async generator function to recursively walk tree structures
 * and support streaming results with cancellation support.
 */

import { type ICancellationToken } from './cancellationToken';

/**
 * Basic tree node interface
 */
export interface TreeNode {
  [key: string]: unknown;
  children?: TreeNode[];
}

/**
 * Tree walker options
 */
export interface TreeWalkerOptions {
  /** Maximum depth to traverse (default: Infinity) */
  maxDepth?: number;
  /** Cancellation token for aborting the walk */
  cancellationToken?: ICancellationToken;
  /** Filter function to include/exclude nodes */
  filter?: (node: TreeNode, depth: number, path: string[]) => boolean;
  /** Transform function applied to each node before yielding */
  transform?: (node: TreeNode, depth: number, path: string[]) => unknown;
  /** Whether to yield nodes before processing children (pre-order) */
  preOrder?: boolean;
  /** Whether to yield nodes after processing children (post-order) */
  postOrder?: boolean;
  /** Custom function to get children from a node */
  getChildren?: (node: TreeNode) => Promise<TreeNode[]> | TreeNode[];
}

/**
 * Tree walker result with metadata
 */
export interface TreeWalkResult {
  /** The current node */
  node: unknown;
  /** Depth of the node in the tree */
  depth: number;
  /** Path from root to current node */
  path: string[];
  /** Node index at current depth */
  index: number;
  /** Total siblings at current depth */
  siblingCount: number;
}

/**
 * Async generator function to recursively walk a tree structure
 *
 * @param root - Root node of the tree
 * @param options - Walker configuration options
 * @returns AsyncGenerator yielding tree nodes with metadata
 */
export async function* walkTreeAsync(
  root: TreeNode,
  options: TreeWalkerOptions = {}
): AsyncGenerator<TreeWalkResult, void, unknown> {
  const {
    maxDepth = Infinity,
    cancellationToken,
    filter = () => true,
    transform = node => node,
    preOrder = true,
    postOrder = false,
    getChildren = node => node.children || [],
  } = options;

  // Internal recursive walker with circular reference detection
  const visited = new WeakSet();

  async function* walkNode(
    node: TreeNode,
    depth: number = 0,
    path: string[] = [],
    index: number = 0,
    siblingCount: number = 1
  ): AsyncGenerator<TreeWalkResult, void, unknown> {
    // Check cancellation first
    if (cancellationToken?.isCancellationRequested) {
      throw new Error('Tree walk was cancelled');
    }

    // Check depth limit
    if (depth > maxDepth) {
      return;
    }

    // Handle circular references - check before processing
    if (typeof node === 'object' && node !== null) {
      if (visited.has(node)) {
        return; // Skip circular references completely
      }
      // Don't add to visited yet - we'll add after passing filter
    }

    // Apply filter
    if (!filter(node, depth, path)) {
      return;
    }

    // Now add to visited since we're going to process this node
    if (typeof node === 'object' && node !== null) {
      visited.add(node);
    }

    // Check cancellation before yielding
    if (cancellationToken?.isCancellationRequested) {
      throw new Error('Tree walk was cancelled');
    }

    // Pre-order traversal (yield before children)
    if (preOrder) {
      // Check cancellation before yielding
      if (cancellationToken?.isCancellationRequested) {
        throw new Error('Tree walk was cancelled');
      }

      yield {
        node: transform(node, depth, path),
        depth,
        path: [...path],
        index,
        siblingCount,
      };
    }

    // Check cancellation after yielding pre-order
    if (cancellationToken?.isCancellationRequested) {
      throw new Error('Tree walk was cancelled');
    }

    // Get children (support async children retrieval)
    const children = await getChildren(node);

    // Check cancellation after async operation
    if (cancellationToken?.isCancellationRequested) {
      throw new Error('Tree walk was cancelled');
    }

    // Check cancellation after async operation
    if (cancellationToken?.isCancellationRequested) {
      throw new Error('Tree walk was cancelled');
    }

    if (children && children.length > 0) {
      // Process children
      for (let i = 0; i < children.length; i++) {
        // Check cancellation before processing each child
        if (cancellationToken?.isCancellationRequested) {
          throw new Error('Tree walk was cancelled');
        }

        const child = children[i];
        const childPath = [...path, `child_${i}`];

        // Check cancellation before recursing into child
        if (cancellationToken?.isCancellationRequested) {
          throw new Error('Tree walk was cancelled');
        }

        yield* walkNode(child, depth + 1, childPath, i, children.length);

        // Check cancellation after each child
        if (cancellationToken?.isCancellationRequested) {
          throw new Error('Tree walk was cancelled');
        }
      }
    }

    // Post-order traversal (yield after children)
    if (postOrder) {
      // Final cancellation check before yielding post-order
      if (cancellationToken?.isCancellationRequested) {
        throw new Error('Tree walk was cancelled');
      }

      yield {
        node: transform(node, depth, path),
        depth,
        path: [...path],
        index,
        siblingCount,
      };
    }
  }

  // Check cancellation before starting
  if (cancellationToken?.isCancellationRequested) {
    throw new Error('Tree walk was cancelled');
  }

  // Start walking from root
  yield* walkNode(root, 0, ['root'], 0, 1);
}

/**
 * Convenience function to collect all results from tree walk
 *
 * @param root - Root node of the tree
 * @param options - Walker configuration options
 * @returns Promise resolving to array of all tree walk results
 */
export async function collectTreeResults(
  root: TreeNode,
  options?: TreeWalkerOptions
): Promise<TreeWalkResult[]> {
  const results: TreeWalkResult[] = [];

  for await (const result of walkTreeAsync(root, options)) {
    results.push(result);
  }

  return results;
}

/**
 * Stream tree walker with chunked results
 *
 * @param root - Root node of the tree
 * @param chunkSize - Number of results per chunk
 * @param options - Walker configuration options
 * @returns AsyncGenerator yielding chunks of tree walk results
 */
export async function* walkTreeInChunks(
  root: TreeNode,
  chunkSize: number = 10,
  options: TreeWalkerOptions = {}
): AsyncGenerator<TreeWalkResult[], void, unknown> {
  const chunk: TreeWalkResult[] = [];

  for await (const result of walkTreeAsync(root, options)) {
    chunk.push(result);

    if (chunk.length >= chunkSize) {
      yield [...chunk];
      chunk.length = 0;
    }
  }

  // Yield remaining items
  if (chunk.length > 0) {
    yield [...chunk];
  }
}

/**
 * Example usage with a simple file system tree
 */
export interface FileNode extends TreeNode {
  name: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileNode[];
}

/**
 * Async file system tree walker example
 */
export async function* walkFileSystemAsync(
  rootPath: string,
  options: Omit<TreeWalkerOptions, 'getChildren'> & {
    includeFiles?: boolean;
    includeDirectories?: boolean;
  } = {}
): AsyncGenerator<TreeWalkResult<FileNode>, void, unknown> {
  const fs = await import('fs/promises');
  const path = await import('path');

  const { includeFiles = true, includeDirectories = true, ...walkerOptions } = options;

  async function getFileNode(filePath: string): Promise<FileNode> {
    const stats = await fs.stat(filePath);
    const name = path.basename(filePath);

    if (stats.isDirectory()) {
      const entries = await fs.readdir(filePath);
      const children = await Promise.all(
        entries
          .map(entry => getFileNode(path.join(filePath, entry)))
          .filter(async node => {
            const resolved = await node;
            return includeFiles || resolved.type === 'directory';
          })
      );

      return {
        name,
        type: 'directory',
        children: includeDirectories ? children : children.filter(c => c.type === 'file'),
      };
    } else {
      return {
        name,
        type: 'file',
        size: stats.size,
      };
    }
  }

  const rootNode = await getFileNode(rootPath);

  yield* walkTreeAsync(rootNode, {
    ...walkerOptions,
    filter: (node, depth, path) => {
      if (!walkerOptions.filter?.(node, depth, path)) {
        return false;
      }

      const fileNode = node as FileNode;
      if (fileNode.type === 'file' && !includeFiles) {
        return false;
      }
      if (fileNode.type === 'directory' && !includeDirectories) {
        return false;
      }

      return true;
    },
  }) as AsyncGenerator<TreeWalkResult<FileNode>, void, unknown>;
}
