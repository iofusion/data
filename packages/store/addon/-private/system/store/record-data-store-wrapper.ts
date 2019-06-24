import { RecordDataStoreWrapper as IRecordDataStoreWrapper } from '../../ts-interfaces/record-data-store-wrapper';
import Store from '../store';

type Store = InstanceType<typeof Store>;

export default class RecordDataStoreWrapper implements IRecordDataStoreWrapper {
  _store: Store;
  _willUpdateManyArrays: boolean;
  _pendingManyArrayUpdates: string[];

  constructor(store: Store) {
    this._store = store;
    this._willUpdateManyArrays = false;
    this._pendingManyArrayUpdates = [];
  }

  // TODO this exists just to the default recordData can
  //  check this in debug for relationships
  //  we can do away with this with a bit of refactoring
  // of the relationship layer
  _hasModelFor(modelName: string) {
    return this._store._hasModelFor(modelName);
  }

  _scheduleManyArrayUpdate(modelName, id, clientId, key) {
    let pending = (this._pendingManyArrayUpdates = this._pendingManyArrayUpdates || []);
    pending.push(modelName, id, clientId, key);

    if (this._willUpdateManyArrays === true) {
      return;
    }

    this._willUpdateManyArrays = true;
    let backburner: any = this._store._backburner;

    backburner.join(() => {
      backburner.schedule('syncRelationships', this, this._flushPendingManyArrayUpdates);
    });
  }

  _flushPendingManyArrayUpdates() {
    if (this._willUpdateManyArrays === false) {
      return;
    }

    let pending = this._pendingManyArrayUpdates;
    this._pendingManyArrayUpdates = [];
    this._willUpdateManyArrays = false;
    let store = this._store;

    for (let i = 0; i < pending.length; i += 4) {
      let modelName = pending[i];
      let id = pending[i + 1];
      let clientId = pending[i + 2];
      let key = pending[i + 3];
      let internalModel = store._getInternalModelForId(modelName, id, clientId);
      internalModel.notifyHasManyChange(key);
    }
  }

  attributesDefinitionFor(modelName) {
    return this._store._attributesDefinitionFor(modelName);
  }

  relationshipsDefinitionFor(modelName) {
    return this._store._relationshipsDefinitionFor(modelName);
  }

  inverseForRelationship(modelName, key) {
    let modelClass = this._store.modelFor(modelName);
    return this.relationshipsDefinitionFor(modelName)[key]._inverseKey(this._store, modelClass);
  }

  // TODO Igor David cleanup
  inverseIsAsyncForRelationship(modelName, key) {
    let modelClass = this._store.modelFor(modelName);
    return this.relationshipsDefinitionFor(modelName)[key]._inverseIsAsync(this._store, modelClass);
  }

  notifyPropertyChange(modelName, id, clientId, key) {
    let internalModel = this._store._getInternalModelForId(modelName, id, clientId);
    internalModel.notifyPropertyChange(key);
  }

  notifyHasManyChange(modelName, id, clientId, key) {
    this._scheduleManyArrayUpdate(modelName, id, clientId, key);
  }

  notifyBelongsToChange(modelName, id, clientId, key) {
    let internalModel = this._store._getInternalModelForId(modelName, id, clientId);
    internalModel.notifyBelongsToChange(key);
  }

  recordDataFor(modelName, id, clientId) {
    return this._store.recordDataFor(modelName, id, clientId);
  }

  setRecordId(modelName, id, clientId) {
    this._store.setRecordId(modelName, id, clientId);
  }

  isRecordInUse(modelName, id, clientId) {
    let internalModel = this._store._getInternalModelForId(modelName, id, clientId);
    if (!internalModel) {
      return false;
    }
    return internalModel.isRecordInUse();
  }

  disconnectRecord(modelName, id, clientId) {
    let internalModel = this._store._getInternalModelForId(modelName, id, clientId);
    if (internalModel) {
      internalModel.destroyFromRecordData();
    }
  }
}
