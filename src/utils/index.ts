/**
 * Barrel exports for utility functions
 */

// Basic utilities
export { default as cn } from './cn';
export { compose, curry, partial, pipe, uncurry } from './curry';
export { default as debounce } from './debounce';
export { default as errorHandler } from './errorHandler';
export { default as fuzzySearch } from './fuzzySearch';
export { default as logger } from './logger';
export { default as sanitizer } from './sanitizer';
export { default as weakMapCache } from './weakMapCache';

// Functional programming utilities
export {
  chain,
  comparePerformance,
  composeCont,
  cont,
  createCPS,
  done,
  factorialAccCPS,
  factorialCPS,
  fibonacciCPS,
  filterCPS,
  identity,
  inOrderCPS,
  isEvenCPS,
  isOddCPS,
  mapCPS,
  reverseAccCPS,
  sumListCPS,
  trampoline,
  type Bounce,
  type CPSFunction,
  type TreeNode as CPSTreeNode,
  type Continuation,
  type RecursiveFunction,
} from './tailCallOptimization';

// Async utilities
export {
  createAsyncDebounce,
  createSideEffectManager,
  debounceAsync,
  type DebounceAsyncOptions,
  type SideEffectManager,
} from './asyncDebounce';

export {
  AdaptiveTaskExecutor,
  AsyncMutex,
  PriorityTaskQueue,
  Semaphore,
  TaskQueue,
  processBatch,
  type ExecutorMetrics,
  type QueueStats,
  type TaskFunction,
  type TaskResult,
} from './asyncConcurrency';

export {
  CancellationToken,
  CancellationTokenSource,
  CompositeCancellationToken,
  TimeoutCancellationTokenSource,
  allTokens,
  anyToken,
  fromAbortSignal,
  neverCancels,
  withTimeout,
  type CancellationToken as ICancellationToken,
} from './cancellationToken';

export {
  CancellablePipeline,
  createPipeline,
  type PipelineOptions,
  type PipelineResult,
  type PipelineStage,
} from './cancellablePipeline';

export {
  RetryStrategy,
  createRetryStrategy,
  retry,
  type RetryConfig,
  type RetryOptions,
} from './retry';

export {
  collectTreeResults,
  walkFileSystemAsync,
  walkTreeAsync,
  walkTreeInChunks,
  type FileNode,
  type TreeNode,
  type TreeWalkResult,
  type TreeWalkerOptions,
} from './asyncTreeWalker';

export {
  createPollingObservable,
  createPollingSubscription,
  pollQuick,
  pollUntilCondition,
  pollWithExponentialBackoff,
  pollWithLinearBackoff,
  type PollingObserver,
  type PollingResult,
  type PollingSubscription,
  type ReactivePollingConfig,
} from './reactivePolling';

// Performance utilities
export {
  CHUNK_CONFIGS,
  createChunkOptimizedLazyComponent,
  getChunkMetrics,
  preloadChunks,
  useChunkOptimizedLoading,
  type ChunkLoadingStrategy,
} from './chunkOptimizedLazyLoad';
export { default as devicePerformance } from './devicePerformance';
export { default as performance } from './performance';

// UI utilities
export { default as AnnouncementManager } from './AnnouncementManager';
export { default as AriaLiveDebugger } from './AriaLiveDebugger';
export { default as colorVisionDeficiency } from './colorVisionDeficiency';
export {
  default as contrastVerification,
  default as highContrastVerification,
} from './contrastVerification';

// Data utilities
export { default as mapUrlUtils } from './mapUrlUtils';
export { default as metadata } from './metadata';
export { default as radarFrames } from './radarFrames';
export { default as sectionUtils } from './sectionUtils';
export { default as weatherBuffer } from './weatherBuffer';

// Security utilities
export { default as objectImmutabilityAnalysis } from './objectImmutabilityAnalysis';
export { default as prototypePollutionDetector } from './prototypePollutionDetector';
export { default as safeObjectOperations } from './safe-object-operations';

// HTTP utilities
export { default as preferenceAwareHttpClient } from './preferenceAwareHttpClient';

// Custom implementations
export { ConcatSpreadableCollection, createConcatSpreadableCollection } from './concatSpreadable';
export { default as CustomPromise } from './CustomPromise';
export {
  Currency,
  SmartValue,
  Temperature,
  createCurrency,
  createSmartValue,
  createTemperature,
} from './customToPrimitive';

// JSON Visitor Pattern
export {
  BaseJSONVisitor,
  JSONWalker,
  StringCollectorVisitor,
  collectStrings,
  collectStringsWithPaths,
  type IJSONVisitor,
  type ITraversalOptions,
  type IVisitContext,
  type JSONValue,
} from './jsonVisitor';
