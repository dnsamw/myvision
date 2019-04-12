import { isDrawingInProgress } from '../../../objects/polygon/polygon';
import assignRemovePointsOnExistingPolygonEvents from '../eventHandlers/removePointsEventHandlers';
import assignRemovePointsOnDrawPolygonEvents from '../eventHandlers/removePointsOnDrawPolygonEventHandlers';
import assignDrawPolygonEvents from '../eventHandlers/drawPolygonEventHandlers';
import assignDefaultEvents from '../eventHandlers/defaultEventHandlers';
import setDefaultCursorMode from '../../cursorModes/defaultMode';

/* UX Consideration:
  Do not offer the delete particular point button as users will more likely
  use the undo button when creating and will likely want to remove multiple
  points when editing an existing polygon
*/

// move to worker
function assignRemovePointsEvents(canvas) {
  const drawing = isDrawingInProgress();
  if (drawing) {
    assignRemovePointsOnDrawPolygonEvents(canvas);
  } else if (!drawing) {
    assignRemovePointsOnExistingPolygonEvents(canvas);
  }
}

function discardRemovePointsEvents(canvas) {
  // is this still drawing after manually removing all polygon points
  const drawing = isDrawingInProgress();
  if (drawing) {
    assignDrawPolygonEvents(canvas, true);
    return false;
  }
  setDefaultCursorMode(canvas, true);
  assignDefaultEvents(canvas);
  return true;
}

export { assignRemovePointsEvents, discardRemovePointsEvents };