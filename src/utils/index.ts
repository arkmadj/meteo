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
} from './asyncConcurrency';

export {
  CancellationTokenSource,
  CompositeCancellationToken,
  TimeoutCancellationTokenSource,
  allTokens,
  anyToken,
  fromAbortSignal,
  neverCancels,
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

export * from './retry';

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
  useChunkOptimizedLoading,
  usePreloadChunks,
  type ChunkLoadingStrategy,
} from './chunkOptimizedLazyLoad';
export * from './devicePerformance';
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
  type ContrastIssue,
  type TextSize,
  type WCAGLevel,
} from './contrastVerification';

// Data utilities
export * from './mapUrlUtils';
export * from './metadata';
export * from './radarFrames';
export * from './sectionUtils';
export * from './weatherBuffer';

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
