import { CloudVertexAIClient} from './client';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import {
  createCloudStorageAIVertexModelEntity,
} from './converters';
import {AiServicesEntitiesSpec, AiServicesStepsSpec} from './constants';
import { ServiceUsageName } from "../../google-cloud/types";
import {getElementFromField} from "../../utils/location";
import {LOCATIONS_FIELD} from "../../constants";

export async function fetchVertexAIModels(
    context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new CloudVertexAIClient({ config });

  try {
    await client.iterateAIModels(context, async (model) => {
      const region = getElementFromField(model.name?? "", LOCATIONS_FIELD)
      const modelEntity = createCloudStorageAIVertexModelEntity({
        data: model,
        region: region,
        projectId: client.projectId,
      });
      await jobState.addEntity(modelEntity);
    });
  } catch (err) {
    logger.warn({ err }, 'Error occurred in getting vertexAI models');
  }
}

export const AiServicesSteps: GoogleCloudIntegrationStep[] = [
  {
    id: AiServicesStepsSpec.FETCH_VERTEXAI_MODELS.id,
    name: AiServicesStepsSpec.FETCH_VERTEXAI_MODELS.name,
    entities: [AiServicesEntitiesSpec.VERTEXAI_MODEL],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchVertexAIModels,
    permissions: ['aiplatform.models.list'],
    apis: [ServiceUsageName.VERTEXAI],
  },
];
