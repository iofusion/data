import Relationships from '../system/relationships/state/create';
import Relationship from '../system/relationships/state/relationship';
import RecordData from './record-data';
import { RecordIdentifier } from './identifier';
import { RecordDataStoreWrapper } from './record-data-store-wrapper';

export interface RelationshipRecordData extends RecordData {
  //Required by the relationship layer
  isNew(): boolean;
  modelName: string;
  storeWrapper: RecordDataStoreWrapper;
  id: string | null;
  clientId: string | null;
  isEmpty(): boolean;
  getResourceIdentifier(): RecordIdentifier;
  _relationships: Relationships;
  _implicitRelationships: {
    [key: string]: Relationship;
  };
}
