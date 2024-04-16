import { google, storage_v1, file_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';
import { IntegrationStepContext } from '../../types';
import {
  IMetricsConfig,
  IMetricsResponse,
  getCloudResourceMetrics,
} from '../../utils/metrics';
import { StorageMetrics } from './constants';

export class CloudStorageClient extends Client {
  private client = google.storage({ version: 'v1', retry: false });
  private fileClient = google.file({ version: 'v1', retry: false });

  async iterateCloudStorageBuckets(
    callback: (data: storage_v1.Schema$Bucket) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.buckets.list({
          project: this.projectId,
          auth,
          pageToken: nextPageToken,
        });
      },
      async (data: storage_v1.Schema$Buckets) => {
        await this.executeConcurrently(data.items, callback);
      },
    );
  }

  async iterateCloudStorageFiles(
    context: IntegrationStepContext,
    callback: (data: file_v1.Schema$Instance) => Promise<void>,
  ): Promise<void> {
    const { logger } = context;

    const auth = await this.getAuthenticatedServiceClient();

    try {
      await this.iterateApi(
        async (nextPageToken) => {
          return this.fileClient.projects.locations.instances.list({
            auth,
            parent: `projects/${this.projectId}/locations/-`,
            pageToken: nextPageToken,
          });
        },
        async (data: file_v1.Schema$ListInstancesResponse) => {
          for (const instance of data.instances || []) {
            await callback(instance);
          }
        },
      );
    } catch (err) {
      logger.warn({ err }, 'Error while iterating cloud storage files API');
      return err;
    }
  }

  async getPolicy(bucket: string): Promise<storage_v1.Schema$Policy> {
    const auth = await this.getAuthenticatedServiceClient();

    const result = await this.client.buckets.getIamPolicy({
      auth,
      bucket,
    });

    return result.data;
  }

  async getStorageMetrics(
    context: IntegrationStepContext,
    bucketId: string,
  ): Promise<IMetricsResponse> {
    const storageMetricsResponse: IMetricsResponse = {
      count: 0,
      size: 0,
    };
    const { logger } = context;
    try {
      const auth = await this.getAuthenticatedServiceClient();

      const resourceLabel = 'bucket_name';
      const resourceTypeStorage = 'gcs_bucket';

      for (const metric of StorageMetrics.STORAGE_BUCKET) {
        logger.info({ name: metric.name }, 'fetching storage metrics');

        const config: IMetricsConfig = {
          assetId: bucketId,
          metricType: metric.metricType,
          projectId: this.projectId,
          resourceLabel: resourceLabel,
          resourceType: resourceTypeStorage,
        };

        const metrics = await getCloudResourceMetrics(auth, logger, config);
        storageMetricsResponse[metric.unit] = metrics;
      }

      return storageMetricsResponse;
    } catch (error) {
      logger.warn({ error }, `error fetching metrics for bucket "${bucketId}"`);
      return storageMetricsResponse;
    }
  }
}
