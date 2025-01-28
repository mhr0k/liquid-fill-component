import {
  ElementType,
  ComponentPropsWithoutRef,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
gsap.registerPlugin(useGSAP);

type direction = 'up' | 'down' | 'left' | 'right';

interface HoverFillProps<T extends ElementType> {
  as?: T;
  children?: React.ReactNode;
  color?: string;
  opacity?: number;
  duration?: number;
  pin?: boolean;
  invertColors?: boolean;
  mouse?: boolean;
  touch?: boolean;
  focus?: boolean;
  focusEnter?: direction;
  focusLeave?: direction;
  invertDirection?: boolean;
  z?: 'auto' | number;
}

interface HoverFillMethods {
  slideDownOut: () => void;
  slideUpIn: () => void;
  slideUpOut: () => void;
  slideDownIn: () => void;
  slideLeftIn: () => void;
  slideRightIn: () => void;
  slideLeftOut: () => void;
  slideRightOut: () => void;
}

const HoverFill = forwardRef(
  <T extends ElementType = 'div'>(
    {
      as,
      children,
      color = 'white',
      opacity = 1,
      duration = 0.5,
      pin = false,
      invertColors = true,
      mouse = true,
      touch = true,
      focus = true,
      focusEnter = 'up',
      focusLeave = 'down',
      invertDirection = false,
      z = invertColors ? 'auto' : -1,
      ...props
    }: HoverFillProps<T> & ComponentPropsWithoutRef<T>,
    forwardedRef: React.ForwardedRef<HoverFillMethods | HTMLElement>
  ) => {
    const Component = (as || 'div') as ElementType;

    const svgRef = useRef(null);
    const pathRef = useRef(null);
    const containerRef = useRef<HTMLElement | null>(null);
    const isFilledRef = useRef(false);
    const syncForwardedRef = (el: HTMLElement) => {
      if (!el) return;
      containerRef.current = el;
      if (typeof forwardedRef === 'function') {
        forwardedRef(el);
      } else if (forwardedRef) {
        forwardedRef.current = el;
      }
    };

    const vbCenter = `0 0 100 100`;
    const vbTop = '0 101 100 100';
    const vbBottom = '0 -101 100 100';
    const vbLeft = '101 0 100 100';
    const vbRight = '-101 0 100 100';

    const squarePath = `M 0 0 Q 50 0 100 0 Q 100 50 100 100 Q 50 100 0 100 Q 0 50 0 0`;
    const concaveTopPath = `M 0 0 Q 50 50 100 0 Q 100 50 100 100 Q 50 100 0 100 Q 0 50 0 0`;
    const concaveRightPath = `M 0 0 Q 50 0 100 0 Q 50 50 100 100 Q 50 100 0 100 Q 0 50 0 0`;
    const concaveBottomPath = `M 0 0 Q 50 0 100 0 Q 100 50 100 100 Q 50 50 0 100 Q 0 50 0 0`;
    const concaveLeftPath = `M 0 0 Q 50 0 100 0 Q 100 50 100 100 Q 50 100 0 100 Q 50 50 0 0`;
    const convexTopPath =
      'M 0 0 Q 50 -50 100 0 Q 100 50 100 100 Q 50 100 0 100 Q 0 50 0 0';
    const convexBottomPath =
      'M 0 0 Q 50 0 100 0 Q 100 50 100 100 Q 50 150 0 100 Q 0 50 0 0';
    const convexLeftPath = `M 0 0 Q 50 0 100 0 Q 100 50 100 100 Q 50 100 0 100 Q -50 50 0 0`;
    const convexRightPath = `M 0 0 Q 50 0 100 0 Q 150 50 100 100 Q 50 100 0 100 Q 0 50 0 0`;

    const animation = (vbFrom: string, vbTo: string, drawPath: string) => {
      const svg = svgRef.current;
      const path = pathRef.current;
      const tl = gsap.timeline({
        defaults: { duration: duration, ease: 'power2.out' },
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
              d: squarePath,
            },
          },
          '-=70%'
        );
    };

    const slideDownOut = () => {
      animation(vbCenter, vbBottom, concaveTopPath);
    };

    const slideUpIn = () => {
      animation(vbBottom, vbCenter, convexTopPath);
    };

    const slideUpOut = () => {
      animation(vbCenter, vbTop, concaveBottomPath);
    };

    const slideDownIn = () => {
      animation(vbTop, vbCenter, convexBottomPath);
    };

    const slideLeftIn = () => {
      animation(vbLeft, vbCenter, convexRightPath);
    };

    const slideRightIn = () => {
      animation(vbRight, vbCenter, convexLeftPath);
    };

    const slideLeftOut = () => {
      animation(vbCenter, vbLeft, concaveRightPath);
    };

    const slideRightOut = () => {
      animation(vbCenter, vbRight, concaveLeftPath);
    };

    useImperativeHandle(forwardedRef, () => ({
      slideDownOut,
      slideUpIn,
      slideUpOut,
      slideDownIn,
      slideLeftIn,
      slideRightIn,
      slideLeftOut,
      slideRightOut,
    }));

    const getClosestEdge = (e: PointerEvent) => {
      const rect = containerRef.current!.getBoundingClientRect();
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
      console.log(distances);
      distances.sort((a, b) => a.distance - b.distance);
      return distances[0].edge as direction;
    };

    const invert = (direction: direction) => {
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

    const animate = (closestEdge: direction, fill = true) => {
      if (pin) return;
      if (fill && isFilledRef.current) return;
      if (!fill && !isFilledRef.current) return;
      switch (invertDirection ? invert(closestEdge) : closestEdge) {
        case 'up':
          fill ? slideDownIn() : slideUpOut();
          break;
        case 'down':
          fill ? slideUpIn() : slideDownOut();
          break;
        case 'left':
          fill ? slideLeftIn() : slideLeftOut();
          break;
        case 'right':
          fill ? slideRightIn() : slideRightOut();
      }
      if (fill) isFilledRef.current = true;
      if (!fill) isFilledRef.current = false;
    };

    const { contextSafe } = useGSAP(() => {
      gsap.set(svgRef.current, {
        attr: { viewBox: pin ? vbCenter : vbTop },
      });
      gsap.set(pathRef.current, { attr: { d: squarePath } });

      if (touch) {
        const handlePointerDown = (e: PointerEvent) => {
          if (e.pointerType === 'touch') {
            if (containerRef.current?.contains(e.target as Node)) {
              animate(getClosestEdge(e), true);
            } else {
              animate(getClosestEdge(e), false);
            }
          }
        };
        window.addEventListener('pointerdown', handlePointerDown);
        return () =>
          window.removeEventListener('pointerdown', handlePointerDown);
      }
    });

    const handlePointerEnter = contextSafe((e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        animate(getClosestEdge(e));
      }
    });

    const handlePointerLeave = contextSafe((e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        animate(getClosestEdge(e), false);
      }
    });

    const handleFocus = contextSafe(() => {
      animate(invert(focusEnter));
    });

    const handleBlur = contextSafe(() => {
      animate(invert(focusLeave), false);
    });

    return (
      <Component
        ref={syncForwardedRef} // containerRef
        {...(mouse ? { onPointerEnter: handlePointerEnter } : {})}
        {...(mouse ? { onPointerLeave: handlePointerLeave } : {})}
        {...(focus ? { onFocus: handleFocus } : {})}
        {...(focus ? { onBlur: handleBlur } : {})}
        {...props}
      >
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
