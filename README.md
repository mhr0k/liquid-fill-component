A React component that creates smooth, directional hover effects with GSAP animations. The component reveals a fill color from the direction of user interaction, supporting mouse, touch, and keyboard focus events.

![Showcase](https://github.com/mhr0k/hoverFill/blob/master/showcase.gif)

## Features

- Directional fill animations (up, down, left, right)
- Mouse, touch, and keyboard focus support
- Customizable colors and opacity
- Invertible colors with blend mode
- Configurable animation duration
- Imperative handle with advanced control methods
- Forward ref support with animation methods

## Installation

```bash
npm install gsap @gsap/react
```

## Basic Usage

```jsx
import HoverFill from './HoverFill';

function App() {
  const fillRef = useRef(null);

  return (
    <HoverFill
      ref={fillRef}
      style={{ position: 'relative' }}
      as="button"
      color="blue"
      duration={0.3}
    >
      Animated button
    </HoverFill>
  );
}
```

## Props

| Prop              | Type                                  | Default          | Description                   |
| ----------------- | ------------------------------------- | ---------------- | ----------------------------- |
| `as`              | `ElementType`                         | `'div'`          | Element type to render        |
| `color`           | `string`                              | `'white'`        | Fill color                    |
| `opacity`         | `number`                              | `1`              | Fill opacity                  |
| `duration`        | `number`                              | `0.5`            | Animation duration in seconds |
| `invertColors`    | `boolean`                             | `true`           | Use difference blend mode     |
| `mouse`           | `boolean`                             | `true`           | Enable mouse interactions     |
| `touch`           | `boolean`                             | `true`           | Enable touch interactions     |
| `focus`           | `boolean`                             | `true`           | Enable keyboard focus         |
| `focusEnter`      | `'up' \| 'down' \| 'left' \| 'right'` | `'up'`           | Focus entry direction         |
| `focusLeave`      | `'up' \| 'down' \| 'left' \| 'right'` | `'down'`         | Focus exit direction          |
| `invertDirection` | `boolean`                             | `undefined`      | Invert animation directions   |
| `z`               | `'auto' \| number`                    | `'auto'` or `-1` | Z-index of the fill effect    |

## Methods

Control animations imperatively with methods exposed via ref:

```jsx
const fillRef = useRef(null);

// Lock/Unlock the fill state
fillRef.current.lock();
fillRef.current.unlock();

// Check if mouse is currently over the element
const isMouseOver = await fillRef.current.checkMouse();

// Manually trigger animations
fillRef.current.animate('up', 'in');
fillRef.current.animate('down', 'out');
```

## Considerations

- Ensure the parent element has `position: relative` or `position: absolute`
- Use `z` prop to control layering of the fill effect
- Disable unnecessary interaction types (`mouse`, `touch`, `focus`) to optimize performance

## License

MIT
