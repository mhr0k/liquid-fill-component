# Changelog

## [1.1.0]

### Added

- Imperative handle methods for advanced control
  - `lock()`: Prevent automatic animations
  - `unlock()`: Re-enable automatic animations
  - `checkMouse()`: Asynchronous method to check if mouse is over the element
  - More flexible `animate()` method with direction and in/out control

### Changed

- Refactored internal animation logic for more precise control
- Improved type definitions for better TypeScript support
- Updated default behavior of `z` index to be more intuitive
- Enhanced animation performance and smoothness

### Deprecated

- Removed direct slide methods in favor of the new `animate()` method

### Fixed

- Resolved potential issues with touch and mouse interaction handling
- Improved cross-browser compatibility
- Fixed edge cases in animation direction detection
