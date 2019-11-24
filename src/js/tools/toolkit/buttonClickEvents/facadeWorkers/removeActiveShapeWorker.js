import {
  removePolygon, clearAllAddPointsData, isAddingPointsToPolygon,
  removePolygonPoints, getPolygonIdIfEditing,
} from '../../../../canvas/objects/polygon/alterPolygon/alterPolygon';
import {
  resetNewPolygonData, isPolygonDrawingInProgress, isPolygonDrawingFinished, resetDrawPolygonMode,
} from '../../../../canvas/objects/polygon/polygon';
import { clearBoundingBoxData, isBoundingBoxDrawingFinished, resetDrawBoundingBoxMode } from '../../../../canvas/objects/boundingBox/boundingBox';
import { removeEditedPolygonId, removeActiveLabelObject } from '../../../../canvas/mouseInteractions/mouseEvents/eventWorkers/editPolygonEventsWorker';
import purgeCanvasMouseEvents from '../../../../canvas/mouseInteractions/mouseEvents/resetCanvasUtils/purgeAllMouseHandlers';
import assignAddPointsOnExistingPolygonEvents from '../../../../canvas/mouseInteractions/mouseEvents/eventHandlers/addPointsEventHandlers';
import setInitialStageOfAddPointsOnExistingPolygonMode from '../../../../canvas/mouseInteractions/cursorModes/initialiseAddPointsOnExistingPolygonMode';
import {
  getAddingPolygonPointsState, getContinuousDrawingState,
  getRemovingPolygonPointsState, setRemovingPolygonPointsState,
} from '../facadeWorkersUtils/stateManager';
import { isLabelling, removeTargetShape } from '../../../labellerPopUp/labellingProcess';
import { hideLabelPopUp } from '../../../labellerPopUp/style';
import assignDrawPolygonEvents from '../../../../canvas/mouseInteractions/mouseEvents/eventHandlers/drawPolygonEventHandlers';
import { removeLabel } from '../../../../canvas/objects/label/label';
import { removeLabelFromListOnShapeDelete } from '../../../labelList/labelList';
import { removeShape } from '../../../../canvas/objects/allShapes/allShapes';
import { removeTickSVGOverImageThumbnail } from '../../../imageList/imageList';

function removeBoundingBox(canvas) {
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.shapeName === 'bndBox') {
    removeShape(activeObject.id);
    removeLabel(activeObject.id, canvas);
    removeActiveLabelObject();
    removeLabelFromListOnShapeDelete(activeObject.id);
    clearBoundingBoxData();
    return true;
  }
  return false;
}

function removeIfContinuousDrawing(canvas) {
  if (getContinuousDrawingState()) {
    if (isLabelling()) {
      if (isPolygonDrawingFinished()) {
        hideLabelPopUp();
        removeTargetShape();
        resetDrawPolygonMode();
      } else if (isBoundingBoxDrawingFinished()) {
        hideLabelPopUp();
        removeTargetShape();
        resetDrawBoundingBoxMode();
      }
      return true;
    }
    if (isPolygonDrawingInProgress()) {
      if (getRemovingPolygonPointsState()) {
        setRemovingPolygonPointsState(false);
      }
      resetNewPolygonData();
      purgeCanvasMouseEvents(canvas);
      assignDrawPolygonEvents(canvas);
      return true;
    }
  }
  return false;
}

function removeActiveShapeEvent(canvas) {
  if (!removeIfContinuousDrawing(canvas) && !removeBoundingBox(canvas)) {
    if (isAddingPointsToPolygon()) {
      purgeCanvasMouseEvents(canvas);
      assignAddPointsOnExistingPolygonEvents(canvas);
      clearAllAddPointsData();
      setInitialStageOfAddPointsOnExistingPolygonMode(canvas);
    } else if (getAddingPolygonPointsState()) {
      clearAllAddPointsData();
    }
    removeLabelFromListOnShapeDelete(getPolygonIdIfEditing());
    removePolygon();
    removePolygonPoints();
    removeEditedPolygonId();
  }
  removeTickSVGOverImageThumbnail();
}

export { removeActiveShapeEvent as default };