/**
 * Barrel exports for utility functions
 */

// Basic utilities
export { default as cn } from './cn';
export { compose, curry, partial, pipe, uncurry } from './curry';
export { default as debounce } from './debounce';
export * from './errorHandler';
export * from './fuzzySearch';
export * from './logger';
export * from './sanitizer';
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
  type Continuation,
  type CPSFunction,
  type TreeNode as CPSTreeNode,
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
  processBatch,
  Semaphore,
  TaskQueue,
} from './asyncConcurrency';

export {
  allTokens,
  anyToken,
  CancellationTokenSource,
  CompositeCancellationToken,
  fromAbortSignal,
  neverCancels,
  TimeoutCancellationTokenSource,
  withTimeout,
} from './cancellationToken';
export type {
  CancellationToken,
  CancellationToken as ICancellationToken,
} from './cancellationToken';

export {
  CancellableTaskPipeline,
  CancellationError,
  CancellationPropagationStrategy,
  type CancellationPolicy,
  type PipelineEvents,
  type PipelineExecutionContext,
  type TaskStage,
} from './cancellablePipeline';

// Export retry functions (excluding retryWithBackoff which is also in errorHandler)
export { retryApi, retryNetwork, safeRetry, safeRetryWithResult } from './retry';

export {
  collectTreeResults,
  walkFileSystemAsync,
  walkTreeAsync,
  walkTreeInChunks,
  type FileNode,
  type TreeNode,
  type TreeWalkerOptions,
  type TreeWalkResult,
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
  useChunkOptimizedLoading,
  usePreloadChunks,
  type ChunkLoadingStrategy,
} from './chunkOptimizedLazyLoad';
// Export devicePerformance and performance (note: PerformanceMetrics is in both, using the one from performance)
export * from './performance';

// UI utilities
export * from './AnnouncementManager';
export * from './AriaLiveDebugger';
export * from './colorVisionDeficiency';
// Export contrastVerification functions with different names to avoid conflicts
export {
  getContrastRatio as getWCAGContrastRatio,
  meetsContrastRequirement as meetsWCAGContrastRequirement,
  type ContrastCheckResult,
  type TextSize,
  type WCAGLevel,
} from './contrastVerification';

// Data utilities
export * from './mapUrlUtils';
export * from './metadata';
export * from './radarFrames';
export * from './sectionUtils';

// Security utilities
// Note: objectImmutabilityAnalysis and prototypePollutionDetector files don't exist
// export * from './objectImmutabilityAnalysis';
// export * from './prototypePollutionDetector';
export * from './safe-object-operations';

// HTTP utilities
export * from './preferenceAwareHttpClient';

// Custom implementations
export { ConcatSpreadableCollection, createConcatSpreadableCollection } from './concatSpreadable';
export * from './CustomPromise';
export {
  createCurrency,
  createSmartValue,
  createTemperature,
  Currency,
  SmartValue,
  Temperature,
} from './customToPrimitive';

// JSON Visitor Pattern
export {
  BaseJSONVisitor,
  collectStrings,
  collectStringsWithPaths,
  JSONWalker,
  StringCollectorVisitor,
  type IJSONVisitor,
  type ITraversalOptions,
  type IVisitContext,
  type JSONValue,
} from './jsonVisitor';
