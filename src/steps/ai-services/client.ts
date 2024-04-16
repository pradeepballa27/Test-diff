import { google, aiplatform_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';
import { IntegrationStepContext } from '../../types';
import {iterateRegions} from "../../google-cloud/regions";

export class CloudVertexAIClient extends Client {

  async iterateAIModels(
      context: IntegrationStepContext,
      callback: (data: aiplatform_v1.Schema$GoogleCloudAiplatformV1Model) => Promise<void>,
  ): Promise<void> {
    const { logger } = context;

    const auth = await this.getAuthenticatedServiceClient();

    await iterateRegions(async (region) => {
        try {
          await this.iterateApi(
              async (nextPageToken) => {
              const aiClient = google.aiplatform({version: 'v1', retry: false, rootUrl: `https://${region}-aiplatform.googleapis.com`});
                return aiClient.projects.locations.models.list({
                  auth,
                  parent: `projects/${this.projectId}/locations/${region}`,
                  pageToken: nextPageToken,
                });
              },
              async (data: aiplatform_v1.Schema$GoogleCloudAiplatformV1ListModelsResponse) => {
                for (const model of data.models || []) {
                  await callback(model);
                }
              },
          );
        }
        catch (err) {
          logger.warn({err: err, region: region}, 'Error while fetching AI Vertex model')
        }
      });
  }

}
