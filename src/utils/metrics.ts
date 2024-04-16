import { BaseExternalAccountClient } from 'google-auth-library';
import { bigquery_v2, google, monitoring_v3 } from 'googleapis';
import { IntegrationLogger } from '@jupiterone/integration-sdk-core';

export interface IMetric {
  name: string;
  metricType: string;
  unit: string;
}

export interface IMetricsResponse {
  count?: number;
  size?: number;
}

export interface IMetricsConfig {
  projectId: string;
  metricType: string;
  resourceType: string;
  resourceLabel: string;
  assetId: string;
}

export async function getCloudResourceMetrics(
  auth: BaseExternalAccountClient,
  logger: IntegrationLogger,
  metricsConfig: IMetricsConfig,
): Promise<number> {
  let metricValue = 0;
  const client: monitoring_v3.Monitoring = google.monitoring({
    version: 'v3',
    retry: false,
  });

  const filter: string = generateMetricFilter(metricsConfig);

  const endTime = new Date();
  const startTime = new Date(endTime);
  startTime.setDate(startTime.getDate() - 1);

  logger.info(
    { filter },
    `metrics filter for "${metricsConfig?.resourceType || ''}" having id ${
      metricsConfig?.assetId
    } `,
  );

  const results = await client.projects.timeSeries.list({
    name: `projects/${metricsConfig.projectId}`,
    auth,
    filter,
    'interval.endTime': endTime.toISOString(),
    'interval.startTime': startTime.toISOString(),
  });

  metricValue = extractMetricValue(results.data);
  return metricValue;
}

function generateMetricFilter(config: IMetricsConfig): string {
  return `metric.type="${config.metricType}" resource.type="${config.resourceType}" resource.label.${config.resourceLabel}="${config.assetId}"`;
}

function extractMetricValue(
  metrics: monitoring_v3.Schema$ListTimeSeriesResponse,
): number {
  const timeSeries = metrics?.timeSeries;

  for (const series of timeSeries || []) {
    for (const point of series.points || []) {
      const value = point.value;
      if (value) {
        if (value?.int64Value) {
          return parseInt(value?.int64Value, 10);
        } else if (value?.doubleValue) {
          return value.doubleValue;
        }
      }
    }
  }

  return 0;
}

/**
 * Fetches the table count and total table size of a BigQuery dataset.
 * @param logger The logger instance for logging.
 * @param client The BigQuery client instance.
 * @param auth The authentication client for obtaining credentials.
 * @param projectId The ID of the Google Cloud project.
 * @param datasetId The ID of the BigQuery dataset.
 * @returns IMetricsResponse
 */
export async function fetchBigQueryMetricsByProps(
  logger: IntegrationLogger,
  client: bigquery_v2.Bigquery,
  auth: BaseExternalAccountClient,
  projectId: string,
  datasetId: string,
): Promise<IMetricsResponse> {
  try {
    const tablesResponse = await client.tables.list({
      projectId: projectId,
      datasetId: datasetId,
      auth,
    });

    const tableCount = tablesResponse.data.totalItems || 0;

    const tableSizes = await fetchTableSizes(
      logger,
      client,
      auth,
      projectId,
      datasetId,
    );

    const totalTableSize = tableSizes.reduce((acc, size) => acc + size, 0);

    return { count: tableCount, size: totalTableSize };
  } catch (error) {
    logger.warn('Error fetching BigQuery metrics:', error);
    return { count: 0, size: 0 };
  }
}

/**
 * Fetches the size of an individual table in bytes asynchronously.
 * @param logger The logger instance for logging.
 * @param client The BigQuery client instance.
 * @param auth The authentication client for obtaining credentials.
 * @param projectId The ID of the Google Cloud project.
 * @param datasetId The ID of the BigQuery dataset containing the table.
 * @param tableId The ID of the BigQuery table.
 * @returns A Promise that resolves to the size of the table in bytes.
 */
async function fetchTableSize(
  logger: IntegrationLogger,
  client: bigquery_v2.Bigquery,
  auth: BaseExternalAccountClient,
  projectId: string,
  datasetId: string,
  tableId: string,
): Promise<number> {
  try {
    const tableDataResponse = await client.tables.get({
      projectId: projectId,
      datasetId: datasetId,
      tableId: tableId,
      auth,
    });
    return parseInt(tableDataResponse.data?.numBytes || '0', 10);
  } catch (error) {
    logger.warn({ error }, `Error fetching metadata for table ${tableId}:`);
    return 0; // Return 0 if an error occurs for a table
  }
}

/**
 * Fetches the sizes of all tables in a BigQuery dataset asynchronously.
 * @param logger The logger instance for logging.
 * @param client The BigQuery client instance.
 * @param auth The authentication client for obtaining credentials.
 * @param projectId The ID of the Google Cloud project.
 * @param datasetId The ID of the BigQuery dataset.
 * @returns A Promise that resolves to an array of table sizes in bytes.
 */
async function fetchTableSizes(
  logger: IntegrationLogger,
  client: bigquery_v2.Bigquery,
  auth: BaseExternalAccountClient,
  projectId: string,
  datasetId: string,
): Promise<number[]> {
  try {
    const tablesResponse = await client.tables.list({
      projectId: projectId,
      datasetId: datasetId,
      auth,
    });

    if (tablesResponse.data.tables && tablesResponse.data.tables.length > 0) {
      const tablePromises: Promise<number>[] = tablesResponse.data.tables.map(
        async (table) => {
          if (table.tableReference?.tableId) {
            return fetchTableSize(
              logger,
              client,
              auth,
              projectId,
              datasetId,
              table.tableReference?.tableId,
            );
          } else {
            return 0;
          }
        },
      );

      const tableSizes = await Promise.all(tablePromises);
      return tableSizes;
    }

    // return empty array if no tables
    return [];
  } catch (error) {
    logger.warn({ error }, 'Error fetching table sizes:');
    return [];
  }
}
