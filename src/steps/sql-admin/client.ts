import { google, sqladmin_v1beta4 } from 'googleapis';
import { Client } from '../../google-cloud/client';
import {
  IMetricsConfig,
  IMetricsResponse,
  getCloudResourceMetrics,
} from '../../utils/metrics';
import { SqlMetrics } from './constants';
import {IntegrationStepContext} from "../../types";

export class SQLAdminClient extends Client {
  private client = google.sqladmin({ version: 'v1beta4', retry: false });

  async iterateCloudSQLInstances(
    callback: (data: sqladmin_v1beta4.Schema$DatabaseInstance) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.instances.list({
          project: this.projectId,
          auth,
          pageToken: nextPageToken,
        });
      },
      async (data: sqladmin_v1beta4.Schema$InstancesListResponse) => {
        for (const sqlInstance of data.items || []) {
          await callback(sqlInstance);
        }
      },
    );
  }

  async getCloudSQLMetrics(
      context: IntegrationStepContext,
      databaseId: string,
  ): Promise<IMetricsResponse> {
    const sqlMetricsResponse: IMetricsResponse = {
      count: 0,
      size: 0,
    };
    const { logger } = context;
    try {
      const auth = await this.getAuthenticatedServiceClient();

      const resourceLabel = 'database_id';
      const resourceTypeStorage = 'cloudsql_database';

      for (const metric of SqlMetrics.DATABASE) {
        logger.info({ name: metric.name }, 'fetching SQL metrics');

        const config: IMetricsConfig = {
          assetId: `${this.projectId}:${databaseId}`,
          metricType: metric.metricType,
          projectId: this.projectId,
          resourceLabel: resourceLabel,
          resourceType: resourceTypeStorage,
        };

        const metrics = await getCloudResourceMetrics(auth, logger, config);
        sqlMetricsResponse[metric.unit] = metrics;
      }

      return sqlMetricsResponse;
    } catch (error) {
      logger.warn({ error }, `error fetching metrics for database "${databaseId}"`);
      return sqlMetricsResponse;
    }
  }
}
