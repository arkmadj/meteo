/**
 * Composite Pattern Exports
 *
 * Exports all components of the Composite pattern implementation
 * for representing nested file system structures.
 */

// Core components
export { Directory, File, FileSystemComponent } from './FileSystemComponent';
export type { FileSystemVisitor } from './FileSystemComponent';

// Builder utilities
export { FileSystemBuilder } from './FileSystemBuilder';
export type { FileSystemJSON } from './FileSystemBuilder';

// Visitor implementations
export {
  ContentSearchVisitor,
  ExtensionFilterVisitor,
  FileCounterVisitor,
  PathCollectorVisitor,
  SizeCalculatorVisitor,
  StatisticsVisitor,
  TreePrinterVisitor,
} from './FileSystemVisitors';

// Examples file not yet created
// export {
//   example1_BasicFileSystem,
//   example2_UsingBuilder,
//   example3_SearchOperations,
//   example4_VisitorPattern,
//   example5_ComprehensiveStats,
//   example6_ContentSearch,
//   example7_JSONSerialization,
//   example8_DynamicModifications,
//   runAllExamples,
// } from './examples';
