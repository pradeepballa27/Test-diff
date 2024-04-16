import { CloudStorageClient } from './client';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import {
  createCloudStorageBucketEntity,
  createCloudStorageFileEntity,
} from './converters';
import { StorageStepsSpec, StorageEntitiesSpec } from './constants';
import { storage_v1 } from 'googleapis';
import {
  publishMissingPermissionEvent,
  publishUnprocessedBucketsEvent,
} from '../../utils/events';
import { OrgPolicyClient } from '../orgpolicy/client';
import { ServiceUsageName } from "../../google-cloud/types";
import {getElementFromField, isZonalLocation} from "../../utils/location";
import {LOCATIONS_FIELD} from "../../constants";

export async function fetchStorageBuckets(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new CloudStorageClient({ config });
  const orgPolicyClient = new OrgPolicyClient({ config });

  let publicAccessPreventionPolicy: boolean | undefined = undefined;

  try {
    publicAccessPreventionPolicy =
      await orgPolicyClient.fetchOrganizationPublicAccessPreventionPolicy();
  } catch (err) {
    logger.warn(
      { err },
      'Error fetching organization public access prevention policy',
    );

    if (
      err.code === 403 &&
      (err.message as string).includes(
        `Permission 'orgpolicy.policy.get' denied on resource`,
      )
    ) {
      publishMissingPermissionEvent({
        logger,
        permission: 'orgpolicy.policy.get',
        stepId: StorageStepsSpec.FETCH_STORAGE_BUCKETS.id,
      });
    }
  }

  const bucketIdsWithUnprocessedPolicies: string[] = [];
  await client.iterateCloudStorageBuckets(async (bucket) => {
    const bucketId = bucket.id as string;

    let bucketPolicy: storage_v1.Schema$Policy | undefined;
    try {
      bucketPolicy = await client.getPolicy(bucketId);
    } catch (err) {
      if (
        err.message ===
        'Bucket is requester pays bucket but no user project provided.'
      ) {
        bucketIdsWithUnprocessedPolicies.push(bucketId);
      } else {
        throw err;
      }
    }

    // fetch metrics
    const metrics = await client.getStorageMetrics(context, bucketId);

    const bucketEntity = createCloudStorageBucketEntity({
      data: bucket,
      projectId: client.projectId,
      bucketPolicy,
      publicAccessPreventionPolicy,
      metrics,
    });

    await jobState.addEntity(bucketEntity);
  });

  // NOTE: Being unable to process "requestor pays" buckets is a non-fatal error,
  // and should _not_ cause dependent steps from running.
  //
  // See here for more info: https://cloud.google.com/storage/docs/requester-pays
  if (bucketIdsWithUnprocessedPolicies.length) {
    logger.info(
      {
        numUnprocessedBucketPolicies: bucketIdsWithUnprocessedPolicies.length,
      },
      'Unprocessed bucket policies due to being configured with "requestor pays"',
    );

    publishUnprocessedBucketsEvent({
      logger,
      bucketIdsWithUnprocessedPolicies,
    });
  }
}

export async function fetchStorageFiles(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new CloudStorageClient({ config });

  try {
    await client.iterateCloudStorageFiles(context, async (file) => {
      let region = getElementFromField(file.name?? "", LOCATIONS_FIELD)
      // zonal filestore instance will give zone and regional will give region in locations
      if (isZonalLocation(region)) {
        region = region.slice(0,region.length-2)?? ""
      }
      const fileEntity = createCloudStorageFileEntity({
        data: file,
        region: region,
        projectId: client.projectId,
      });
      await jobState.addEntity(fileEntity);
    });
  } catch (err) {
    logger.warn({ err }, 'Error occurred in getting storage files');
  }
}

export const storageSteps: GoogleCloudIntegrationStep[] = [
  {
    id: StorageStepsSpec.FETCH_STORAGE_BUCKETS.id,
    name: StorageStepsSpec.FETCH_STORAGE_BUCKETS.name,
    entities: [StorageEntitiesSpec.STORAGE_BUCKET],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchStorageBuckets,
    permissions: [
      'orgpolicy.policies.list',
      'orgpolicy.policy.get',
      'storage.buckets.list',
      'storage.buckets.getIamPolicy',
      'monitoring.timeSeries.list',
    ],
    apis: [
      'orgpolicy.googleapis.com',
      'storage.googleapis.com',
      ServiceUsageName.MONITORING,
    ],
  },
  {
    id: StorageStepsSpec.FETCH_STORAGE_FILES.id,
    name: StorageStepsSpec.FETCH_STORAGE_FILES.name,
    entities: [StorageEntitiesSpec.STORAGE_FILE],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchStorageFiles,
    permissions: ['file.instances.list'],
    apis: [ServiceUsageName.FILE],
  },
];
