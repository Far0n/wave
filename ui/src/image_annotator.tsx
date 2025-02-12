import * as Fluent from '@fluentui/react'
import { B, F, Id, Rec, S, U } from 'h2o-wave'
import React from 'react'
import { stylesheet } from 'typestyle'
import { AnnotatorTags } from './text_annotator'
import { clas, cssVar, cssVarValue, px } from './theme'
import { wave } from './ui'

/** Create a rectangular annotation shape. */
interface ImageAnnotatorRect {
  /** `x` coordinate of the rectangle's corner. */
  x1: F
  /** `y` coordinate of the rectangle's corner. */
  y1: F
  /** `x` coordinate of the diagonally opposite corner. */
  x2: F
  /** `y` coordinate of the diagonally opposite corner. */
  y2: F
}

/** Create a shape to be rendered as an annotation on an image annotator. */
interface ImageAnnotatorShape {
  rect?: ImageAnnotatorRect
}

/** Create a unique tag type for use in an image annotator. */
interface ImageAnnotatorTag {
  /** An identifying name for this tag. */
  name: Id
  /** Text to be displayed for the annotation. */
  label: S
  /** Hex or RGB color string to be used as the background color. */
  color: S
}

/** Create an annotator item with initial selected tags or no tag for plaintext. */
interface ImageAnnotatorItem {
  /** The annotation shape. */
  shape: ImageAnnotatorShape
  /** The `name` of the image annotator tag to refer to for the `label` and `color` of this item. */
  tag: S
}

/**
 * Create an image annotator component.
 * 
 * This component allows annotating and labeling parts of an image by drawing shapes with a pointing device.
 */
export interface ImageAnnotator {
  /** An identifying name for this component. */
  name: Id
  /** The path or URL of the image to be presented for annotation. */
  image: S
  /** The image annotator's title. */
  title: S
  /** The master list of tags that can be used for annotations. */
  tags: ImageAnnotatorTag[]
  /** Annotations to display on the image, if any. */
  items?: ImageAnnotatorItem[]
  /** True if the form should be submitted as soon as an annotation is drawn. */
  trigger?: B
  /** The card’s image height. The actual image size is used by default. */
  image_height?: S
}

type Position = {
  x: U
  y: U
  dragging?: B
}

type DrawnShape = ImageAnnotatorItem & {
  isFocused?: B
}

const
  css = stylesheet({
    title: {
      color: cssVar('$primary'),
      marginBottom: 8
    },
    canvas: {
      display: 'block',
      margin: '0 auto',
      cursor: 'crosshair',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    },
    canvasContainer: {
      position: 'relative',
      margin: 8
    }
  }),
  ARC_RADIUS = 4,
  MIN_RECT_WIDTH = 5,
  MIN_RECT_HEIGHT = 5,
  isIntersectingRect = (cursor_x: U, cursor_y: U, rect?: ImageAnnotatorRect) => {
    if (!rect) return false
    const
      { x2, x1, y2, y1 } = rect,
      x_min = Math.min(x1, x2),
      x_max = Math.max(x1, x2),
      y_min = Math.min(y1, y2),
      y_max = Math.max(y1, y2)

    return cursor_x > x_min && cursor_x < x_max && cursor_y > y_min && cursor_y < y_max
  },
  eventToCursor = (event: React.MouseEvent, rect: DOMRect) => ({ cursor_x: event.clientX - rect.left, cursor_y: event.clientY - rect.top }),
  drawCircle = (ctx: CanvasRenderingContext2D, x: U, y: U, fillColor: S) => {
    ctx.beginPath()
    ctx.fillStyle = fillColor
    const path = new Path2D()
    path.arc(x, y, ARC_RADIUS, 0, 2 * Math.PI)
    ctx.fill(path)
    ctx.closePath()
  },
  drawRect = (ctx: CanvasRenderingContext2D, { x1, x2, y1, y2 }: ImageAnnotatorRect, strokeColor: S, isFocused = false) => {
    ctx.beginPath()
    ctx.lineWidth = 3
    ctx.strokeStyle = strokeColor
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)
    ctx.closePath()
    if (isFocused) {
      ctx.beginPath()
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1)
      ctx.closePath()
      drawCircle(ctx, x1, y1, strokeColor)
      drawCircle(ctx, x2, y1, strokeColor)
      drawCircle(ctx, x2, y2, strokeColor)
      drawCircle(ctx, x1, y2, strokeColor)
    }
  },
  getCorner = (x: U, y: U, { x1, y1, x2, y2 }: ImageAnnotatorRect, ignoreMaxMin = false) => {
    const
      x_min = ignoreMaxMin ? x1 : Math.min(x1, x2),
      x_max = ignoreMaxMin ? x2 : Math.max(x1, x2),
      y_min = ignoreMaxMin ? y1 : Math.min(y1, y2),
      y_max = ignoreMaxMin ? y2 : Math.max(y1, y2)
    if (x > x_min - ARC_RADIUS && x < x_min + ARC_RADIUS && y > y_min - ARC_RADIUS && y < y_min + ARC_RADIUS) return 'topLeft'
    else if (x > x_min - ARC_RADIUS && x < x_min + ARC_RADIUS && y > y_max - ARC_RADIUS && y < y_max + ARC_RADIUS) return 'topRight'
    else if (x > x_max - ARC_RADIUS && x < x_max + ARC_RADIUS && y > y_min - ARC_RADIUS && y < y_min + ARC_RADIUS) return 'bottomLeft'
    else if (x > x_max - ARC_RADIUS && x < x_max + ARC_RADIUS && y > y_max - ARC_RADIUS && y < y_max + ARC_RADIUS) return 'bottomRight'
  },
  getCornerCursor = (shape: ImageAnnotatorRect, cursor_x: U, cursor_y: U) => {
    const corner = getCorner(cursor_x, cursor_y, shape)
    if (corner === 'topLeft' || corner === 'bottomRight') return 'nwse-resize'
    if (corner === 'bottomLeft' || corner === 'topRight') return 'nesw-resize'
  },
  getCorrectCursor = (drawnShapes: DrawnShape[], cursor_x: U, cursor_y: U, focused?: DrawnShape) => {
    const intersected = drawnShapes.find(shape => isIntersectingRect(cursor_x, cursor_y, shape.shape.rect))
    if (intersected?.isFocused && intersected.shape.rect) return getCornerCursor(intersected.shape.rect, cursor_x, cursor_y) || 'move'
    else if (focused?.shape.rect) return getCornerCursor(focused.shape.rect, cursor_x, cursor_y) || 'crosshair'
    else if (intersected) return 'pointer'
    return 'crosshair'
  },
  createRect = (x1: F, x2: F, y1: F, y2: F, { width, height }: HTMLCanvasElement) =>
    Math.abs(x2 - x1) <= MIN_RECT_WIDTH || Math.abs(y2 - y1) <= MIN_RECT_HEIGHT ? undefined : {
      x1: x1 > width ? width : x1 < 0 ? 0 : x1,
      x2: x2 > width ? width : x2 < 0 ? 0 : x2,
      y1: y1 > height ? height : y1 < 0 ? 0 : y1,
      y2: y2 > height ? height : y2 < 0 ? 0 : y2,
    }

export const XImageAnnotator = ({ model }: { model: ImageAnnotator }) => {
  const
    colorsMap = React.useMemo(() => new Map<S, S>(model.tags.map(tag => [tag.name, cssVarValue(tag.color)])), [model.tags]),
    [activeTag, setActiveTag] = React.useState<S>(model.tags[0]?.name || ''),
    [drawnShapes, setDrawnShapes] = React.useState<DrawnShape[]>([]),
    imgRef = React.useRef<HTMLCanvasElement>(null),
    canvasRef = React.useRef<HTMLCanvasElement>(null),
    [aspectRatio, setAspectRatio] = React.useState(1),
    startPosition = React.useRef<Position | undefined>(undefined),
    ctxRef = React.useRef<CanvasRenderingContext2D | undefined | null>(undefined),
    resizedCornerRef = React.useRef<S | undefined>(undefined),
    movedShapeRef = React.useRef<DrawnShape | undefined>(undefined),
    activateTag = React.useCallback((tagName: S) => () => setActiveTag(tagName), [setActiveTag]),
    redrawExistingShapes = React.useCallback(() => {
      const canvas = canvasRef.current
      const ctx = ctxRef.current
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      setDrawnShapes(shapes => {
        shapes.forEach(item => {
          if (item.shape.rect) drawRect(ctx, item.shape.rect, colorsMap.get(item.tag) || cssVarValue('$red'), item.isFocused)
        })
        return shapes
      })
    }, [colorsMap]),
    onMouseDown = (e: React.MouseEvent) => {
      if (e.button !== 0) return // Ignore right-click.
      const canvas = canvasRef.current
      if (!canvas) return

      const
        { cursor_x, cursor_y } = eventToCursor(e, canvas.getBoundingClientRect()),
        focused = drawnShapes.find(({ isFocused }) => isFocused)

      if (focused?.shape.rect) resizedCornerRef.current = getCorner(cursor_x, cursor_y, focused.shape.rect, true)
      startPosition.current = { x: cursor_x, y: cursor_y }
    },
    onMouseMove = (e: React.MouseEvent) => {
      const
        canvas = canvasRef.current,
        ctx = ctxRef.current
      if (!canvas || !ctx) return

      const
        { cursor_x, cursor_y } = eventToCursor(e, canvas.getBoundingClientRect()),
        focused = drawnShapes.find(({ isFocused }) => isFocused),
        clickStartPosition = startPosition.current

      if (clickStartPosition) {
        const
          intersected = drawnShapes.find(shape => isIntersectingRect(cursor_x, cursor_y, shape.shape.rect)),
          x1 = clickStartPosition.x,
          y1 = clickStartPosition.y

        clickStartPosition.dragging = true
        if (focused?.shape.rect && resizedCornerRef.current) {
          if (resizedCornerRef.current === 'topLeft') {
            focused.shape.rect.x1 += cursor_x - x1
            focused.shape.rect.y1 += cursor_y - y1
          }
          else if (resizedCornerRef.current === 'topRight') {
            focused.shape.rect.x1 += cursor_x - x1
            focused.shape.rect.y2 += cursor_y - y1
          }
          else if (resizedCornerRef.current === 'bottomLeft') {
            focused.shape.rect.x2 += cursor_x - x1
            focused.shape.rect.y1 += cursor_y - y1
          }
          else if (resizedCornerRef.current === 'bottomRight') {
            focused.shape.rect.x2 += cursor_x - x1
            focused.shape.rect.y2 += cursor_y - y1
          }
          startPosition.current = { x: cursor_x, y: cursor_y }
          redrawExistingShapes()
        }
        else if (movedShapeRef.current || intersected?.isFocused) {
          movedShapeRef.current = movedShapeRef.current || intersected
          canvas.style.cursor = 'move'
          if (!movedShapeRef.current?.shape.rect) return

          const
            rect = movedShapeRef.current.shape.rect,
            xIncrement = cursor_x - x1,
            yIncrement = cursor_y - y1,
            newX1 = rect.x1 + xIncrement,
            newX2 = rect.x2 + xIncrement,
            newY1 = rect.y1 + yIncrement,
            newY2 = rect.y2 + yIncrement,
            { width, height } = canvas

          // Prevent moving behind image boundaries.
          if (newX1 < rect.x1 && newX1 < 0) rect.x1 = Math.max(0, newX1)
          else if (newX2 < rect.x2 && newX2 < 0) rect.x2 = Math.max(0, newX2)
          else if (newY1 < rect.y1 && newY1 < 0) rect.y1 = Math.max(0, newY1)
          else if (newY2 < rect.y2 && newY2 < 0) rect.y2 = Math.max(0, newY2)
          else if (newX1 > rect.x1 && newX1 > width) rect.x1 = Math.min(newX1, width)
          else if (newX2 > rect.x2 && newX2 > width) rect.x2 = Math.min(newX2, width)
          else if (newY1 > rect.y1 && newY1 > height) rect.y1 = Math.min(newY1, height)
          else if (newY2 > rect.y2 && newY2 > height) rect.y2 = Math.min(newY2, height)
          else {
            rect.x1 = newX1
            rect.x2 = newX2
            rect.y1 = newY1
            rect.y2 = newY2
          }

          startPosition.current = { x: cursor_x, y: cursor_y }
          redrawExistingShapes()
        }
        else {
          setDrawnShapes(shapes => shapes.map(shape => ({ ...shape, isFocused: false })))
          redrawExistingShapes()
          const newRect = createRect(x1, cursor_x, y1, cursor_y, canvas)
          if (newRect) {
            drawRect(ctx, newRect, colorsMap.get(activeTag) || cssVarValue('$red'))
          }
        }
      }
      else {
        canvas.style.cursor = getCorrectCursor(drawnShapes, cursor_x, cursor_y, focused)
      }
    },
    onClick = (e: React.MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const
        start = startPosition.current,
        rect = canvas.getBoundingClientRect(),
        { cursor_x, cursor_y } = eventToCursor(e, rect),
        newShapes = [...drawnShapes]

      if (start) {
        const newRect = createRect(start.x, cursor_x, start.y, cursor_y, canvas)
        if (newRect) newShapes.unshift({ shape: { rect: newRect }, tag: activeTag })
      }

      if (!resizedCornerRef.current && !start?.dragging && e.type !== 'mouseleave') {
        newShapes.forEach(shape => shape.isFocused = false)
        const intersecting = drawnShapes.find(shape => isIntersectingRect(cursor_x, cursor_y, shape.shape.rect))
        if (intersecting) intersecting.isFocused = true
      }

      startPosition.current = undefined
      movedShapeRef.current = undefined
      resizedCornerRef.current = ''
      canvas.style.cursor = getCorrectCursor(newShapes, cursor_x, cursor_y, newShapes.find(({ isFocused }) => isFocused))
      setDrawnShapes(newShapes)
      redrawExistingShapes()
    },
    remove = (_e?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>, item?: Fluent.IContextualMenuItem) => {
      if (!item) return
      setDrawnShapes(shapes => item.key === 'remove-selected' ? shapes.filter(s => !s.isFocused) : [])
      redrawExistingShapes()
    }

  React.useEffect(() => {
    const img = new Image()
    img.src = model.image
    img.onload = () => {
      const imgCanvas = imgRef.current
      const canvas = canvasRef.current
      if (!imgCanvas || !canvas) return
      ctxRef.current = canvas.getContext('2d')

      const ctx = imgCanvas.getContext('2d')
      if (!ctx) return

      const height = model.image_height ? +model.image_height.replace('px', '') : img.naturalHeight
      const aspectRatio = height / img.naturalHeight
      setAspectRatio(aspectRatio)
      imgCanvas.height = height
      imgCanvas.width = img.naturalWidth * aspectRatio
      canvas.height = height
      canvas.width = img.naturalWidth * aspectRatio
      canvas.style.zIndex = '1'
      canvas.parentElement!.style.height = px(height)

      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width * aspectRatio, img.height * aspectRatio)
      setDrawnShapes((model.items || []).map(({ tag, shape }) => {
        if (shape.rect) return {
          tag,
          shape: {
            rect: {
              x1: shape.rect.x1 * aspectRatio,
              x2: shape.rect.x2 * aspectRatio,
              y1: shape.rect.y1 * aspectRatio,
              y2: shape.rect.y2 * aspectRatio,
            }
          }
        }
        return { tag, shape }
      }))
      redrawExistingShapes()
    }
  }, [model.name, model.image, model.image_height, redrawExistingShapes, model.items])

  React.useEffect(() => {
    wave.args[model.name] = drawnShapes.map(({ tag, shape }) => {
      if (shape.rect) return {
        tag,
        shape: {
          rect: {
            x1: shape.rect.x1 / aspectRatio,
            x2: shape.rect.x2 / aspectRatio,
            y1: shape.rect.y1 / aspectRatio,
            y2: shape.rect.y2 / aspectRatio,
          }
        }
      }
      return { tag, shape }
    }) as unknown as Rec[]
  }, [aspectRatio, drawnShapes, model.name])

  return (
    <div data-test={model.name}>
      <div className={clas('wave-s16 wave-w6', css.title)}>{model.title}</div>
      <AnnotatorTags tags={model.tags} activateTag={activateTag} activeTag={activeTag} />
      <Fluent.CommandBar styles={{ root: { padding: 0 } }} items={[
        {
          key: 'remove-selected',
          text: 'Remove selection',
          onClick: remove,
          disabled: drawnShapes.every(s => !s.isFocused),
          iconProps: { iconName: 'RemoveContent', styles: { root: { fontSize: 20 } } },
        },
        {
          key: 'remove-all',
          text: 'Remove all',
          onClick: remove,
          disabled: drawnShapes.length === 0,
          iconProps: { iconName: 'DependencyRemove', styles: { root: { fontSize: 20 } } },
        },
      ]} />
      <div className={css.canvasContainer}>
        <canvas ref={imgRef} className={css.canvas} />
        <canvas ref={canvasRef} className={css.canvas} onMouseMove={onMouseMove} onMouseDown={onMouseDown} onMouseLeave={onClick} onClick={onClick} />
      </div>
    </div >
  )
}