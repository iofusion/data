import InternalModel from '../system/model/internal-model';
import { promiseObject } from '../system/promise-proxies';

/**
 * Get the materialized model from the internalModel/promise
 * that returns an internal model and return it in a promiseObject.
 *
 * Useful for returning from find methods
 *
 * @private
 * @param internalModelPromise
 * @param label
 */
export default function promiseRecord(internalModelPromise: Promise<InternalModel>, label: string) {
  let toReturn = internalModelPromise.then(internalModel => internalModel.getRecord());

  return promiseObject(toReturn, label);
}
