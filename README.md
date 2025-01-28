# HoverFill

A React component that creates smooth, directional hover effects with GSAP animations. The component reveals a fill color from the direction of user interaction, supporting mouse, touch, and keyboard focus events.

![Alt Text](https://github.com/mhr0k/hoverFill/blob/master/showcase.gif)

## Features

- Directional fill animations (up, down, left, right)
- Mouse, touch, and keyboard focus support
- Customizable colors and opacity
- Invertible colors with blend mode
- Configurable animation duration
- Pinnable state
- Forward ref support with animation methods

## Installation

```bash
npm install gsap @gsap/react
```

## Basic Usage

```jsx
import HoverFill from './HoverFill';

function App() {
  return (
    <HoverFill
      {/* Must be a positioned element! */}
      style={{position: relative}}
      as="button"
    >
      Animated button
    </HoverFill>
  );
}
```

## Props

- `as`: Element type to render (default: 'div')
- `color`: Fill color (default: 'white')
- `opacity`: Fill opacity (default: 1)
- `duration`: Animation duration in seconds (default: 0.5)
- `pin`: Lock the fill state (default: false)
- `invertColors`: Use difference blend mode (default: true)
- `mouse`: Enable mouse interactions (default: true)
- `touch`: Enable touch interactions (default: true)
- `focus`: Enable keyboard focus (default: true)
- `focusEnter`: Focus entry direction (default: 'up')
- `focusLeave`: Focus exit direction (default: 'down')
- `invertDirection`: Invert animation directions (default: false)
- `z`: Z-index of the fill effect (default: auto/-1)

## Methods

Access animation methods via ref:

```jsx
const fillRef = useRef();

// Available methods
fillRef.current.slideDownOut();
fillRef.current.slideUpIn();
fillRef.current.slideUpOut();
fillRef.current.slideDownIn();
fillRef.current.slideLeftIn();
fillRef.current.slideRightIn();
fillRef.current.slideLeftOut();
fillRef.current.slideRightOut();
```

## License

MIT
