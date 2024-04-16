import { IMetric } from '../../utils/metrics';

export const StorageStepsSpec = {
  FETCH_STORAGE_BUCKETS: {
    id: 'fetch-cloud-storage-buckets',
    name: 'Cloud Storage Buckets',
  },
  FETCH_STORAGE_FILES: {
    id: 'fetch-cloud-storage-files',
    name: 'Cloud Storage Files',
  },
};

export const StorageEntitiesSpec = {
  STORAGE_BUCKET: {
    resourceName: 'Cloud Storage Bucket',
    _type: 'google_storage_bucket',
    _class: 'DataStore',
  },
  STORAGE_FILE: {
    resourceName: 'Cloud Storage File',
    _type: 'google_storage_filestore_instance',
    _class: 'DataStore',
  },
};

export const StorageMetrics: Record<string, IMetric[]> = {
  STORAGE_BUCKET: [
    {
      name: 'total_bytes',
      metricType: 'storage.googleapis.com/storage/total_bytes',
      unit: 'size',
    },
    {
      name: 'object_count',
      metricType: 'storage.googleapis.com/storage/object_count',
      unit: 'count',
    },
  ],
};
