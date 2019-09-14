import { getCanvasProperties, getImageProperties } from '../facadeWorkersUtils/uploadFile/uploadImage';

let currentZoom = 1;
let canvas = null;
let canvasProperties = null;
let imageProperties = null;
let stubElement;
let zoomOverflowWrapperElement;
let zoomOverflowElement;
let canvasElement;
let newCanvasWidth;
let newCanvasHeight;
let canReduceShapeSizes = true;
let canIncreaseShapeSizes = false;
let timesZoomedWithNoShapeReduction = 0;
let timesZoomedWithNoShapeIncrease = 0;
const reduceShapeSizeRatios = {};
const increaseShapeSizeRatios = {
  polygon: 0.104, point: 0.1, label: 0.08, bndBox: 0.104,
};

function zoomInObjects() {
  if (canReduceShapeSizes) {
    if (timesZoomedWithNoShapeIncrease === 0) {
      canvas.forEachObject((iteratedObj) => {
        switch (iteratedObj.shapeName) {
          case 'polygon':
            iteratedObj.strokeWidth -= iteratedObj.strokeWidth * increaseShapeSizeRatios.polygon;
            break;
          case 'point':
            iteratedObj.radius -= iteratedObj.radius * increaseShapeSizeRatios.point;
            iteratedObj.strokeWidth -= iteratedObj.strokeWidth * increaseShapeSizeRatios.point;
            break;
          case 'label':
            iteratedObj.fontSize -= iteratedObj.fontSize * increaseShapeSizeRatios.label;
            if (iteratedObj.attachedShape === 'polygon') {
              iteratedObj.top += 0.2;
            }
            if (iteratedObj.fontSize < 3.2) {
              canReduceShapeSizes = false;
            }
            break;
          case 'bndBox':
            iteratedObj.strokeWidth -= iteratedObj.strokeWidth * increaseShapeSizeRatios.bndBox;
            break;
          default:
            break;
        }
      });
      canvas.renderAll();
      canIncreaseShapeSizes = true;
    } else {
      timesZoomedWithNoShapeIncrease -= 1;
    }
  } else {
    timesZoomedWithNoShapeReduction += 1;
  }
}

function zoomOutObjects() {
  if (canIncreaseShapeSizes) {
    if (timesZoomedWithNoShapeReduction === 0) {
      canvas.forEachObject((iteratedObj) => {
        switch (iteratedObj.shapeName) {
          case 'polygon':
            if (iteratedObj.strokeWidth > 1.7499) {
              canIncreaseShapeSizes = false;
              timesZoomedWithNoShapeIncrease += 1;
              break;
            }
            iteratedObj.strokeWidth *= reduceShapeSizeRatios.polygon;
            console.log(iteratedObj.strokeWidth);
            break;
          case 'point':
            iteratedObj.radius *= reduceShapeSizeRatios.point;
            iteratedObj.strokeWidth *= reduceShapeSizeRatios.point;
            break;
          case 'label':
            iteratedObj.fontSize *= reduceShapeSizeRatios.label;
            if (iteratedObj.attachedShape === 'polygon') {
              iteratedObj.top -= 0.2;
            }
            break;
          case 'bndBox':
            iteratedObj.strokeWidth *= reduceShapeSizeRatios.bndBox;
            break;
          default:
            break;
        }
      });
      canvas.renderAll();
      canReduceShapeSizes = true;
    } else {
      timesZoomedWithNoShapeReduction -= 1;
    }
  } else {
    timesZoomedWithNoShapeIncrease += 1;
  }
}

function displayZoomMetrics() {
  //
}

function getScrollWidth() {
  // create a div with the scroll
  const div = document.createElement('div');
  div.style.overflowY = 'scroll';
  div.style.width = '50px';
  div.style.height = '50px';

  // must put it in the document, otherwise sizes will be 0
  document.body.append(div);
  const scrollWidth = div.offsetWidth - div.clientWidth;
  div.remove();
  return scrollWidth;
}

// option to always highlight
// react when the user resizes the screen
// need to click twice on polygon for points to be above label
// bug where the popup doesn't appear on the correct place after zooming or non zooming
// upon moving a polygon, then zooming, the points seem to be in wrong place
// scroll when zoomed in using scroll wheel

function reduceCanvasDimensionsBy(width, height) {
  newCanvasWidth -= width;
  newCanvasHeight -= height;
}

function setCanvasElementProperties(left, top) {
  canvasElement.style.left = left || '50%';
  canvasElement.style.top = top || '';
}

function setZoomOverFlowElementProperties(width, maxWidth, maxHeight) {
  zoomOverflowElement.style.width = width;
  zoomOverflowElement.style.maxWidth = maxWidth;
  zoomOverflowElement.style.maxHeight = maxHeight;
}

function setZoomOverFlowWrapperElementProperties(width, height, left, marginLeft, marginTop) {
  zoomOverflowWrapperElement.style.width = width;
  zoomOverflowWrapperElement.style.height = height;
  zoomOverflowWrapperElement.style.marginLeft = marginLeft;
  zoomOverflowWrapperElement.style.marginTop = marginTop;
  zoomOverflowWrapperElement.style.left = left || '50%';
}

function setStubElementProperties(width, height, marginLeft, marginTop) {
  stubElement.style.width = width;
  stubElement.style.height = height;
  stubElement.style.marginLeft = marginLeft;
  stubElement.style.marginTop = marginTop;
}

function loadCanvasElements() {
  stubElement = document.getElementById('stub');
  zoomOverflowElement = document.getElementById('zoom-overflow');
  zoomOverflowWrapperElement = document.getElementById('zoom-overflow-wrapper');
  canvasElement = document.getElementById('canvas-wrapper-inner');
}

function setAllElementPropertiesToDefault() {
  setZoomOverFlowElementProperties('', '', '');
  setStubElementProperties('', '', '', '');
  setZoomOverFlowWrapperElementProperties('', '', '', '', '');
}

function widthOverlapWithOneVerticalScrollBarOverlap(originalWidth, originalHeight, scrollWidth) {
  const zoomOverflowMaxWidth = `${newCanvasWidth + 1}px`;
  const zoomOverflowMaxHeight = `${Math.round(canvasProperties.maximumCanvasHeight) - 1}px`;
  const zoomOverflowWrapperLeft = `calc(50% - ${Math.round(scrollWidth / 2) - 1}px)`;
  const zoomOverflowWrapperMarginLeft = `${Math.round(scrollWidth / 2) - 2}px`;
  const stubHeight = `${scrollWidth}px`;
  const stubMarginLeft = `${Math.round(originalWidth) - 2}px`;
  const stubMarginTop = `${Math.round(originalHeight) - scrollWidth - (currentZoom - 1)}px`;
  const canvasLeft = `calc(50% - ${scrollWidth / 2 + 1}px)`;
  const canvasTop = `calc(50% - ${Math.round(scrollWidth / 2)}px)`;
  const horizontalScrollOverlap = (Math.round(newCanvasHeight) + scrollWidth)
    - canvasProperties.maximumCanvasHeight + 1;
  setZoomOverFlowElementProperties('', zoomOverflowMaxWidth, zoomOverflowMaxHeight);
  setZoomOverFlowWrapperElementProperties('', '', zoomOverflowWrapperLeft, zoomOverflowWrapperMarginLeft, '');
  setStubElementProperties('', stubHeight, stubMarginLeft, stubMarginTop);
  setCanvasElementProperties(canvasLeft, canvasTop);
  reduceCanvasDimensionsBy(scrollWidth, horizontalScrollOverlap);
}

function widthOverflowDoubleVerticalScrollBarOverlap(originalWidth, originalHeight, scrollWidth) {
  const zoomOverflowMaxWidth = `${newCanvasWidth - 1}px`;
  const zoomOverflowWrapperLeft = `calc(50% - ${scrollWidth / 2}px)`;
  const zoomOverflowWrapperMarginLeft = `${(scrollWidth / 2)}px`;
  const stubWidth = `${originalWidth}px`;
  const stubMarginTop = `${originalHeight - scrollWidth}px`;
  const canvasTop = `calc(50% - ${Math.round((scrollWidth / 2)) - 1}px)`;
  setZoomOverFlowElementProperties('', zoomOverflowMaxWidth, '');
  setZoomOverFlowWrapperElementProperties('', '', zoomOverflowWrapperLeft, zoomOverflowWrapperMarginLeft, '');
  setStubElementProperties(stubWidth, '', '', stubMarginTop);
  setCanvasElementProperties('', canvasTop);
}

function widthOverflowDefault(originalWidth, originalHeight, scrollWidth) {
  const zoomOverflowMaxWidth = `${newCanvasWidth - 1}px`;
  const zoomOverflowWrapperMarginTop = `${Math.round(scrollWidth / 2) - 1}px`;
  const stubMarginLeft = `${originalWidth - 4}px`;
  const stubMarginTop = `${originalHeight - scrollWidth}px`;
  setZoomOverFlowElementProperties('', zoomOverflowMaxWidth, '');
  setZoomOverFlowWrapperElementProperties('', '', '', '', zoomOverflowWrapperMarginTop);
  setStubElementProperties('', '', stubMarginLeft, stubMarginTop);
  setCanvasElementProperties('', '');
}

function heightOverlapWithOneVerticalScrollBarOverlap(originalWidth, originalHeight, scrollWidth) {
  const zoomOverflowWidth = `${canvasProperties.maximumCanvasWidth + 1}px`;
  const zoomOverflowMaxHeight = `${canvasProperties.maximumCanvasHeight}px`;
  const zoomOverflowWrapperLeft = `calc(50% - ${scrollWidth}px)`;
  const zoomOverflowWrapperMarginLeft = `${scrollWidth - 1}px`;
  const stubWidth = `${Math.round(originalWidth) + 2}px`;
  const stubMarginTop = `${originalHeight - scrollWidth - 1}px`;
  const canvasLeft = `calc(50% - ${(scrollWidth / 2)}px)`;
  const canvasTop = `calc(50% - ${Math.round(scrollWidth / 2) + 1}px)`;
  const verticalScrollOverlap = originalWidth + scrollWidth
    - canvasProperties.maximumCanvasWidth + 1;
  setZoomOverFlowElementProperties(zoomOverflowWidth, '', zoomOverflowMaxHeight);
  setZoomOverFlowWrapperElementProperties('', '', zoomOverflowWrapperLeft, zoomOverflowWrapperMarginLeft, '');
  setStubElementProperties(stubWidth, '', '', stubMarginTop);
  setCanvasElementProperties(canvasLeft, canvasTop);
  reduceCanvasDimensionsBy(verticalScrollOverlap, scrollWidth);
}

function heightOverflowWithDoubleVerticalScrollBarOverlap(originalWidth, scrollWidth) {
  const zoomOverflowWrapperLeft = `calc(50% - ${scrollWidth / 2}px)`;
  const zoomOverflowWrapperWidth = `${originalWidth - 1}px`;
  const zoomOverflowWrapperMarginLeft = `${scrollWidth}px`;
  const canvasLeft = `calc(50% - ${(scrollWidth / 2) + 1}px)`;
  setZoomOverFlowElementProperties('', '', '');
  setZoomOverFlowWrapperElementProperties(zoomOverflowWrapperWidth, '', zoomOverflowWrapperLeft,
    zoomOverflowWrapperMarginLeft, '');
  setStubElementProperties('', '', '', '');
  setCanvasElementProperties(canvasLeft, '');
}

function heightOverflowDefault(originalWidth, originalHeight, scrollWidth) {
  const zoomOverflowWidth = `${originalWidth - 1}px`;
  const zoomOverflowMaxHeight = `${newCanvasHeight}px`;
  const zoomOverflowWrapperMarginLeft = `${scrollWidth + 1}px`;
  const stubMarginTop = `${originalHeight - scrollWidth - 1}px`;
  setZoomOverFlowElementProperties(zoomOverflowWidth, '', zoomOverflowMaxHeight);
  setZoomOverFlowWrapperElementProperties('', '', '', zoomOverflowWrapperMarginLeft, '');
  setStubElementProperties('', '', '', stubMarginTop);
  setCanvasElementProperties('', '');
}

function fullOverflowOfWidthAndHeight(originalWidth, originalHeight, scrollWidth) {
  const zoomOverflowWidth = `${newCanvasWidth + 1}px`;
  const zoomOverflowMaxHeight = `${newCanvasHeight - 1}px`;
  const zoomOverflowWrapperLeft = `calc(50% - ${Math.round(scrollWidth / 2)}px)`;
  const zoomOverflowWrapperMarginLeft = `${scrollWidth / 2 - 1}px`;
  const stubMarginLeft = `${Math.round(originalWidth) - 2}px`;
  const stubMarginTop = `${Math.round(originalHeight) - scrollWidth - (currentZoom - 2)}px`;
  const canvasLeft = `calc(50% - ${Math.round(scrollWidth / 2) - 10}px)`;
  const canvasTop = `calc(50% - ${(scrollWidth / 2)}px)`;
  setZoomOverFlowElementProperties(zoomOverflowWidth, '', zoomOverflowMaxHeight);
  setZoomOverFlowWrapperElementProperties('', '', zoomOverflowWrapperLeft, zoomOverflowWrapperMarginLeft, '');
  setStubElementProperties('', '', stubMarginLeft, stubMarginTop);
  setCanvasElementProperties(canvasLeft, canvasTop);
  reduceCanvasDimensionsBy(scrollWidth, scrollWidth + 1);
}

function setNewCanvasDimensions() {
  loadCanvasElements();
  const scrollWidth = getScrollWidth();
  let heightOverflowed = false;
  let widthOverflowed = false;
  newCanvasWidth = imageProperties.width * currentZoom;
  const originalWidth = newCanvasWidth;
  newCanvasHeight = imageProperties.height * currentZoom;
  const originalHeight = newCanvasHeight;
  if (canvasProperties.maximumCanvasHeight < newCanvasHeight) {
    newCanvasHeight = canvasProperties.maximumCanvasHeight;
    heightOverflowed = true;
  }
  if (canvasProperties.maximumCanvasWidth < newCanvasWidth) {
    newCanvasWidth = canvasProperties.maximumCanvasWidth;
    widthOverflowed = true;
  }
  if (heightOverflowed) {
    if (widthOverflowed) {
      fullOverflowOfWidthAndHeight(originalWidth, originalHeight, scrollWidth);
      console.log('horizontal and vertical overlap');
    } else {
      heightOverflowDefault(originalWidth, originalHeight, scrollWidth);
      //console.log('vertical overlap default');
      if (Math.round(newCanvasWidth) + (scrollWidth * 2) >= canvasProperties.maximumCanvasWidth) {
        heightOverflowWithDoubleVerticalScrollBarOverlap(originalWidth, scrollWidth);
        //console.log('vertical double scrollbar overlap');
        if (Math.round(newCanvasWidth) + scrollWidth >= canvasProperties.maximumCanvasWidth - 2) {
          heightOverlapWithOneVerticalScrollBarOverlap(originalWidth, originalHeight, scrollWidth);
          //console.log('vertical single scrollbar overlap');
        }
      }
    }
  } else if (widthOverflowed) {
    widthOverflowDefault(originalWidth, originalHeight, scrollWidth);
    //console.log('horizontal overlap default');
    if (newCanvasHeight + (scrollWidth * 2) > canvasProperties.maximumCanvasHeight) {
      widthOverflowDoubleVerticalScrollBarOverlap(originalWidth, originalHeight, scrollWidth);
      //console.log('horizontal double scrollbar overlap');
      if (newCanvasHeight + (scrollWidth) > canvasProperties.maximumCanvasHeight - 3) {
        widthOverlapWithOneVerticalScrollBarOverlap(originalWidth, originalHeight, scrollWidth);
        //console.log('horizontal single scrollbar overlap');
      }
    }
  } else {
    setAllElementPropertiesToDefault();
    //console.log('set to default');
  }
  const finalImageDimensions = {
    width: newCanvasWidth,
    height: newCanvasHeight,
  };
  canvas.setDimensions(finalImageDimensions);
}

function calculateReduceShapeSizeFactor() {
  Object.keys(increaseShapeSizeRatios).forEach((key) => {
    const ratioToOriginalShapeSize = (1 / increaseShapeSizeRatios[key]);
    const originalShapeSizeToReducedShape = ratioToOriginalShapeSize - 1;
    reduceShapeSizeRatios[key] = ratioToOriginalShapeSize / originalShapeSizeToReducedShape;
  });
}

function zoomCanvas(canvasObj, action) {
  canvas = canvasObj;
  canvasProperties = getCanvasProperties();
  imageProperties = getImageProperties();
  calculateReduceShapeSizeFactor();
  if (action === 'in') {
    currentZoom += 0.2;
    canvas.setZoom(currentZoom);
    zoomInObjects();
  } else if (action === 'out') {
    currentZoom -= 0.2;
    canvas.setZoom(currentZoom);
    zoomOutObjects();
  }
  setNewCanvasDimensions();
}

window.zoomOverflowScroll = (element) => {
  canvas.viewportTransform[4] = -element.scrollLeft;
  canvas.viewportTransform[5] = -element.scrollTop;
  canvas.requestRenderAll();
};

window.zoomOverflowPrepareToScroll = () => {
};

window.zoomOverflowStopScrolling = () => {
};

export { zoomCanvas as default };