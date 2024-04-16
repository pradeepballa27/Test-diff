import { aiplatform_v1 } from 'googleapis';
import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core';
import { AiServicesEntitiesSpec } from './constants';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { length } from 'bunyan-format';

function getModelIdFromEnv(env) {
  // example "env": [{"name": "MODEL_ID", "value": "google/gemma-2b"}]
  const obj = env.find(({ name }) => name === 'MODEL_ID') ?? {};
  return obj.value ?? '';
}

export function createCloudStorageAIVertexModelEntity({
  data,
  region,
  projectId,
}: {
  data: aiplatform_v1.Schema$GoogleCloudAiplatformV1Model;
  region: string;
  projectId: string;
}) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: AiServicesEntitiesSpec.VERTEXAI_MODEL._class,
        _type: AiServicesEntitiesSpec.VERTEXAI_MODEL._type,
        _key: data.name as string,
        id: `model:${data.name}` as string,
        name: data.name,
        region: region,
        displayName: data.displayName as string,
        description: data.description,
        createdOn: parseTimePropertyValue(data.createTime),
        updatedOn: parseTimePropertyValue(data.updateTime),
        modelSourceType: data.modelSourceInfo?.sourceType,
        baseModelID: getModelIdFromEnv(data?.containerSpec?.env ?? []),
        versionID: data.versionId,
        projectId: projectId,
        isDeployed: !!data.deployedModels,
        numberOfEndpoints: data.deployedModels?.length ?? 0,
        kmsKeyName: data.encryptionSpec?.kmsKeyName,
      },
    },
  });
}
