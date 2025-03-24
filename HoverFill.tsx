import {
  ElementType,
  ComponentPropsWithoutRef,
  useRef,
  forwardRef,
  ForwardedRef,
  useImperativeHandle,
  ReactNode,
} from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
gsap.registerPlugin(useGSAP);

type Direction = 'up' | 'down' | 'left' | 'right';
type InOut = 'in' | 'out';
type AnimateOptions = {
  ignoreLock?: boolean;
  ignoreFillState?: boolean;
  callback?: () => void;
};

interface HoverFillProps<T extends ElementType> {
  as?: T;
  children?: ReactNode;
  color?: string;
  opacity?: number;
  duration?: number;
  invertColors?: boolean;
  mouse?: boolean;
  touch?: boolean;
  focus?: boolean;
  focusEnter?: Direction;
  focusLeave?: Direction;
  invertDirection?: boolean;
  z?: 'auto' | number;
}

export interface HoverFillHandle {
  el: HTMLElement | null;
  lock: () => HoverFillHandle;
  unlock: () => HoverFillHandle;
  checkMouse: () => Promise<boolean>;
  animate: (d: Direction, i: InOut, o?: AnimateOptions) => HoverFillHandle;
}

class ListenerManager {
  private cleanups: (() => void)[] = [];

  add<K extends keyof HTMLElementEventMap>(
    el: HTMLElement | Window,
    event: K,
    handler: (ev: HTMLElementEventMap[K]) => void
  ) {
    const eventHandler = handler as EventListener;
    el.addEventListener(event, eventHandler);
    this.cleanups.push(() => el.removeEventListener(event, eventHandler));
  }

  cleanup() {
    this.cleanups.forEach((cleanup) => cleanup());
    this.cleanups = [];
  }
}

const VB = {
  center: `0 0 100 100`,
  top: '0 101 100 100',
  bottom: '0 -101 100 100',
  left: '101 0 100 100',
  right: '-101 0 100 100',
} as const;

const PATH = {
  square: `M 0 0 Q 50 0 100 0 Q 100 50 100 100 Q 50 100 0 100 Q 0 50 0 0`,
  concave: {
    top: `M 0 0 Q 50 50 100 0 Q 100 50 100 100 Q 50 100 0 100 Q 0 50 0 0`,
    right: `M 0 0 Q 50 0 100 0 Q 50 50 100 100 Q 50 100 0 100 Q 0 50 0 0`,
    bottom: `M 0 0 Q 50 0 100 0 Q 100 50 100 100 Q 50 50 0 100 Q 0 50 0 0`,
    left: `M 0 0 Q 50 0 100 0 Q 100 50 100 100 Q 50 100 0 100 Q 50 50 0 0`,
  },
  convex: {
    top: `M 0 0 Q 50 -50 100 0 Q 100 50 100 100 Q 50 100 0 100 Q 0 50 0 0`,
    right: `M 0 0 Q 50 0 100 0 Q 150 50 100 100 Q 50 100 0 100 Q 0 50 0 0`,
    bottom: `M 0 0 Q 50 0 100 0 Q 100 50 100 100 Q 50 150 0 100 Q 0 50 0 0`,
    left: `M 0 0 Q 50 0 100 0 Q 100 50 100 100 Q 50 100 0 100 Q -50 50 0 0`,
  },
} as const;

const getClosestEdge = (e: PointerEvent | MouseEvent) => {
  const rect = (e.target as HTMLElement).getBoundingClientRect();
  const x = e.clientX;
  const y = e.clientY;
  const distances = [
    {
      edge: 'up',
      distance: Math.abs(rect.top - y),
    },
    {
      edge: 'down',
      distance: Math.abs(rect.bottom - y),
    },
    {
      edge: 'left',
      distance: Math.abs(rect.left - x),
    },
    {
      edge: 'right',
      distance: Math.abs(rect.right - x),
    },
  ];
  distances.sort((a, b) => a.distance - b.distance);
  return distances[0].edge as Direction;
};

const invert = (direction: Direction) => {
  switch (direction) {
    case 'up':
      return 'down';
    case 'down':
      return 'up';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
  }
};

const getMousePosition = (): Promise<{ x: number; y: number }> => {
  return new Promise((resolve) => {
    const handleMouseMove = (e: MouseEvent) => {
      resolve({ x: e.clientX, y: e.clientY });
      window.removeEventListener('mousemove', handleMouseMove);
    };
    window.addEventListener('mousemove', handleMouseMove, {
      once: true,
    });
  });
};

const checkMouseOnElement = async (el: HTMLElement) => {
  const mousePosition = await getMousePosition();
  const rect = el.getBoundingClientRect();
  const { x, y } = mousePosition;
  return rect.left <= x && x <= rect.right && rect.top <= y && y <= rect.bottom;
};

const HoverFill = forwardRef(
  <T extends ElementType = 'div'>(
    {
      as,
      children,
      color = 'white',
      opacity = 1,
      duration = 0.5,
      invertColors = true,
      mouse = true,
      touch = true,
      focus = true,
      focusEnter = 'up',
      focusLeave = 'down',
      invertDirection = undefined,
      z = invertColors ? 'auto' : -1,
      ...props
    }: HoverFillProps<T> & ComponentPropsWithoutRef<T>,
    forwardedRef: ForwardedRef<HoverFillHandle>
  ) => {
    const Component = (as || 'div') as ElementType;

    const svgRef = useRef(null);
    const pathRef = useRef(null);
    const lockRef = useRef(false);
    const isFilledRef = useRef(false);
    const containerRef = useRef<HTMLElement | null>(null);

    const animateSVG = (
      vbFrom: string,
      vbTo: string,
      drawPath: string,
      callback?: () => void
    ) => {
      const svg = svgRef.current;
      const path = pathRef.current;
      const tl = gsap.timeline({
        defaults: { duration, ease: 'power2.out' },
        onComplete: callback,
      });
      tl.set(svg, { attr: { viewBox: vbFrom } });

      tl.to(
        svg,
        {
          attr: {
            viewBox: vbTo,
          },
        },
        0
      )
        .to(
          path,
          {
            attr: {
              d: drawPath,
            },
          },
          0
        )
        .to(
          path,
          {
            attr: {
              d: PATH.square,
            },
          },
          '-=70%'
        );
    };

    const slideDownOut = (cb?: () => void) => {
      animateSVG(VB.center, VB.bottom, PATH.concave.top, cb);
    };

    const slideUpIn = (cb?: () => void) => {
      animateSVG(VB.top, VB.center, PATH.convex.bottom, cb);
    };

    const slideUpOut = (cb?: () => void) => {
      animateSVG(VB.center, VB.top, PATH.concave.bottom, cb);
    };

    const slideDownIn = (cb?: () => void) => {
      animateSVG(VB.bottom, VB.center, PATH.convex.top, cb);
    };

    const slideLeftIn = (cb?: () => void) => {
      animateSVG(VB.left, VB.center, PATH.convex.right, cb);
    };

    const slideRightIn = (cb?: () => void) => {
      animateSVG(VB.right, VB.center, PATH.convex.left, cb);
    };

    const slideLeftOut = (cb?: () => void) => {
      animateSVG(VB.center, VB.left, PATH.concave.right, cb);
    };

    const slideRightOut = (cb?: () => void) => {
      animateSVG(VB.center, VB.right, PATH.concave.left, cb);
    };

    const animate = (
      direction: Direction,
      inOut: InOut,
      options?: AnimateOptions
    ) => {
      if (!options?.ignoreLock && lockRef.current) return;
      if (!options?.ignoreFillState) {
        if (inOut === 'in' && isFilledRef.current) return;
        if (inOut === 'out' && !isFilledRef.current) return;
      }
      const cb = options?.callback;
      switch (invertDirection ? invert(direction) : direction) {
        case 'up':
          inOut === 'in' ? slideUpIn(cb) : slideUpOut(cb);
          break;
        case 'down':
          inOut === 'in' ? slideDownIn(cb) : slideDownOut(cb);
          break;
        case 'right':
          inOut === 'in' ? slideRightIn(cb) : slideRightOut(cb);
          break;
        case 'left':
          inOut === 'in' ? slideLeftIn(cb) : slideLeftOut(cb);
      }
      isFilledRef.current = !isFilledRef.current;
    };

    const { contextSafe } = useGSAP(
      () => {
        const listeners = new ListenerManager();
        gsap.set(svgRef.current, {
          attr: { viewBox: isFilledRef.current ? VB.center : VB.top },
        });
        gsap.set(pathRef.current, { attr: { d: PATH.square } });

        if (touch) {
          const handlePointerDown = (e: PointerEvent) => {
            if (e.pointerType === 'touch') {
              if (containerRef.current?.contains(e.target as Node)) {
                animate(invert(getClosestEdge(e)), 'in');
              } else {
                animate(invert(getClosestEdge(e)), 'out');
              }
            }
          };
          listeners.add(window, 'pointerdown', handlePointerDown);
        }

        if (mouse) {
          const handleMouseEnter = contextSafe((e: MouseEvent) => {
            animate(getClosestEdge(e), 'in');
          });
          const handleMouseLeave = contextSafe((e: MouseEvent) => {
            animate(getClosestEdge(e), 'out');
          });

          listeners.add(containerRef.current!, 'mouseenter', handleMouseEnter);
          listeners.add(containerRef.current!, 'mouseleave', handleMouseLeave);
        }

        if (focus) {
          const handleFocus = contextSafe(() => {
            animate(focusEnter, 'in');
          });

          const handleBlur = contextSafe(() => {
            animate(focusLeave, 'out');
          });

          listeners.add(containerRef.current!, 'focus', handleFocus);
          listeners.add(containerRef.current!, 'blur', handleBlur);
        }

        return () => listeners.cleanup();
      },
      { scope: svgRef }
    );

    useImperativeHandle(forwardedRef, (): HoverFillHandle => {
      const self = {
        el: containerRef.current,
        lock() {
          lockRef.current = true;
          return self;
        },
        unlock() {
          lockRef.current = false;
          return self;
        },
        checkMouse() {
          return checkMouseOnElement(containerRef.current!);
        },
        animate(direction: Direction, inOut: InOut, options?: AnimateOptions) {
          animate(direction, inOut, options);
          return self;
        },
      };
      return self;
    });

    return (
      <Component ref={containerRef} {...props}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          viewBox="0 0 0 0"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'absolute',
            fill: color,
            opacity: String(opacity),
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            pointerEvents: 'none',
            mixBlendMode: invertColors ? 'difference' : 'normal',
            zIndex: z,
          }}
        >
          <path ref={pathRef}></path>
        </svg>
        {children}
      </Component>
    );
  }
);

export default HoverFill;
