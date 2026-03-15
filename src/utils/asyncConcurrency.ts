/**
 * Async Concurrency Control Utilities
 *
 * Demonstrates different patterns for parallelizing dynamic async tasks
 * while limiting concurrency using semaphore and queue patterns.
 */

// PATTERN 1: SEMAPHORE-BASED CONCURRENCY CONTROL
export class Semaphore {
  private permits: number;
  private waitQueue: Array<{ resolve: () => void; reject: (error: Error) => void }> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    return new Promise<void>((resolve, reject) => {
      this.waitQueue.push({ resolve, reject });
    });
  }

  release(): void {
    this.permits++;
    if (this.waitQueue.length > 0) {
      const waiter = this.waitQueue.shift()!;
      this.permits--;
      waiter.resolve();
    }
  }

  getAvailablePermits(): number {
    return this.permits;
  }

  getQueueLength(): number {
    return this.waitQueue.length;
  }
}

// PATTERN 2: QUEUE-BASED CONCURRENCY CONTROL (similar to RequestQueue in codebase)
export class TaskQueue<T = any> {
  private queue: Array<() => Promise<T>> = [];
  private activeTasks = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent: number = 6) {
    this.maxConcurrent = maxConcurrent;
  }

  async add<R>(taskFn: () => Promise<R>): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await taskFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.activeTasks >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const taskFn = this.queue.shift();
    if (!taskFn) return;

    this.activeTasks++;

    try {
      await taskFn();
    } finally {
      this.activeTasks--;
      this.processQueue();
    }
  }

  setMaxConcurrent(max: number): void {
    this.maxConcurrent = max;
    this.processQueue();
  }

  getStats(): { active: number; queued: number; maxConcurrent: number } {
    return {
      active: this.activeTasks,
      queued: this.queue.length,
      maxConcurrent: this.maxConcurrent,
    };
  }
}

// PATTERN 3: BATCH PROCESSING WITH CONCURRENCY LIMIT
export async function processBatch<T, R>(
  tasks: Array<() => Promise<T>>,
  processor: (item: T, index: number) => Promise<R>,
  options: {
    concurrency?: number;
    batchSize?: number;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<R[]> {
  const { concurrency = 5, batchSize = 10, onProgress } = options;
  const results: R[] = [];
  let completed = 0;

  // Create batches
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);

    // Process batch with concurrency limit
    const semaphore = new Semaphore(concurrency);
    const batchPromises = batch.map(async (task, batchIndex) => {
      await semaphore.acquire();
      try {
        const item = await task();
        const result = await processor(item, i + batchIndex);
        completed++;
        onProgress?.(completed, tasks.length);
        return result;
      } finally {
        semaphore.release();
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}

// PATTERN 4: DYNAMIC TASK EXECUTOR WITH ADAPTIVE CONCURRENCY
export class AdaptiveTaskExecutor {
  private queue: TaskQueue;
  private metrics: { successRate: number; avgDuration: number; recentErrors: number } = {
    successRate: 1,
    avgDuration: 0,
    recentErrors: 0,
  };
  private taskDurations: number[] = [];
  private maxHistorySize = 50;

  constructor(
    initialConcurrency: number = 5,
    private minConcurrency = 1,
    private maxConcurrency = 20
  ) {
    this.queue = new TaskQueue(initialConcurrency);
  }

  async execute<T>(taskFn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();

    try {
      const result = await this.queue.add(async () => {
        const taskStart = performance.now();
        const taskResult = await taskFn();
        const taskDuration = performance.now() - taskStart;

        this.recordTaskMetrics(taskDuration, true);
        return taskResult;
      });

      return result;
    } catch (error) {
      this.recordTaskMetrics(performance.now() - startTime, false);
      throw error;
    }
  }

  private recordTaskMetrics(duration: number, success: boolean): void {
    // Update task duration history
    this.taskDurations.push(duration);
    if (this.taskDurations.length > this.maxHistorySize) {
      this.taskDurations.shift();
    }

    // Update metrics
    this.metrics.avgDuration =
      this.taskDurations.reduce((a, b) => a + b, 0) / this.taskDurations.length;
    this.metrics.recentErrors = success
      ? Math.max(0, this.metrics.recentErrors - 1)
      : this.metrics.recentErrors + 1;

    const successCount =
      this.taskDurations.filter((_, i) => i < 10).length - this.metrics.recentErrors;
    this.metrics.successRate = Math.max(0, successCount / Math.min(10, this.taskDurations.length));

    // Adjust concurrency based on metrics
    this.adjustConcurrency();
  }

  private adjustConcurrency(): void {
    const currentConcurrency = this.queue.getStats().maxConcurrent;
    let newConcurrency = currentConcurrency;

    // Increase concurrency if high success rate and fast tasks
    if (this.metrics.successRate > 0.9 && this.metrics.avgDuration < 1000) {
      newConcurrency = Math.min(this.maxConcurrency, currentConcurrency + 1);
    }
    // Decrease concurrency if many errors or slow tasks
    else if (this.metrics.successRate < 0.7 || this.metrics.avgDuration > 5000) {
      newConcurrency = Math.max(this.minConcurrency, currentConcurrency - 1);
    }

    if (newConcurrency !== currentConcurrency) {
      this.queue.setMaxConcurrent(newConcurrency);
      console.log(`[AdaptiveExecutor] Adjusted concurrency to ${newConcurrency}`);
    }
  }

  getMetrics(): typeof this.metrics & { currentConcurrency: number } {
    return {
      ...this.metrics,
      currentConcurrency: this.queue.getStats().maxConcurrent,
    };
  }
}

// PATTERN 5: MUTEX FOR MUTUAL EXCLUSION
export class AsyncMutex {
  private locked: boolean = false;
  private waitQueue: Array<{ resolve: () => void; reject: (error: Error) => void }> = [];

  /**
   * Acquire the mutex lock. If the mutex is already locked,
   * the caller will wait until it's released.
   */
  async acquire(): Promise<void> {
    if (!this.locked) {
      this.locked = true;
      return;
    }

    return new Promise<void>((resolve, reject) => {
      this.waitQueue.push({ resolve, reject });
    });
  }

  /**
   * Release the mutex lock, allowing the next waiting task to acquire it.
   */
  release(): void {
    if (!this.locked) {
      throw new Error('Mutex is not locked - cannot release');
    }

    if (this.waitQueue.length > 0) {
      const waiter = this.waitQueue.shift()!;
      waiter.resolve();
      // Keep locked state as the next waiter immediately acquires it
    } else {
      this.locked = false;
    }
  }

  /**
   * Execute a function while holding the mutex lock.
   * This is a convenience method that handles acquire/release automatically.
   */
  async withLock<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  /**
   * Check if the mutex is currently locked.
   */
  isLocked(): boolean {
    return this.locked;
  }

  /**
   * Get the number of tasks waiting to acquire the mutex.
   */
  getQueueLength(): number {
    return this.waitQueue.length;
  }

  /**
   * Force release the mutex and reject all waiting tasks.
   * This should only be used for cleanup or error scenarios.
   */
  forceRelease(reason?: string): void {
    const error = new Error(reason || 'Mutex was force released');

    // Reject all waiting tasks
    while (this.waitQueue.length > 0) {
      const waiter = this.waitQueue.shift()!;
      waiter.reject(error);
    }

    this.locked = false;
  }
}

// PATTERN 6: PRIORITY QUEUE FOR TASKS
interface PriorityTask<T> {
  task: () => Promise<T>;
  priority: number;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

export class PriorityTaskQueue {
  private queue: PriorityTask<any>[] = [];
  private activeTasks = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent: number = 5) {
    this.maxConcurrent = maxConcurrent;
  }

  async add<T>(task: () => Promise<T>, priority: number = 0): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ task, priority, resolve, reject });

      // Use setTimeout to ensure all tasks are added before processing starts
      setTimeout(() => this.processQueue(), 0);
    });
  }

  private async processQueue(): Promise<void> {
    if (this.activeTasks >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    // Sort queue by priority before taking the next task
    this.queue.sort((a, b) => b.priority - a.priority);
    const priorityTask = this.queue.shift()!;
    if (!priorityTask) return;

    this.activeTasks++;

    try {
      const result = await priorityTask.task();
      priorityTask.resolve(result);
    } catch (error) {
      priorityTask.reject(error as Error);
    } finally {
      this.activeTasks--;
      this.processQueue();
    }
  }
}

// USAGE EXAMPLES
export async function exampleUsage() {
  // Example 1: Semaphore pattern
  const semaphore = new Semaphore(3);
  const tasks = Array.from({ length: 10 }, (_, i) => async () => {
    await semaphore.acquire();
    try {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
      return `Task ${i} completed`;
    } finally {
      semaphore.release();
    }
  });

  console.log('Running tasks with semaphore...');
  const results1 = await Promise.all(tasks.map(task => task()));
  console.log('Semaphore results:', results1);

  // Example 2: Queue pattern
  const queue = new TaskQueue(3);
  const results2 = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      queue.add(async () => {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
        return `Queued task ${i}`;
      })
    )
  );
  console.log('Queue results:', results2);

  // Example 3: Batch processing
  const batchTasks = Array.from({ length: 20 }, (_, i) => async () => `Item ${i}`);

  const batchResults = await processBatch(
    batchTasks,
    async (item, index) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return `Processed ${item} at index ${index}`;
    },
    { concurrency: 3, batchSize: 5, onProgress: (c, t) => console.log(`Progress: ${c}/${t}`) }
  );
  console.log('Batch results:', batchResults);

  // Example 4: Mutex pattern
  const mutex = new AsyncMutex();
  let sharedResource = 0;

  const mutexTasks = Array.from({ length: 5 }, async (_, i) => {
    return mutex.withLock(async () => {
      // Critical section - only one task can execute this at a time
      const currentValue = sharedResource;
      await new Promise(resolve => setTimeout(resolve, 100));
      sharedResource = currentValue + 1;
      return `Task ${i} incremented resource to ${sharedResource}`;
    });
  });

  console.log('Running tasks with mutex...');
  const mutexResults = await Promise.all(mutexTasks);
  console.log('Mutex results:', mutexResults);
  console.log('Final shared resource value:', sharedResource);
}
