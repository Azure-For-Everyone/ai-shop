param location string = resourceGroup().location
param containerRegistryName string = 'aishopregistry'
param containerAppName string = 'ai-shop-frontend'
param containerImage string = 'ai-shop-ui:1.0.1'
param containerPort int = 80

resource acr 'Microsoft.ContainerRegistry/registries@2021-06-01-preview' = {
  name: containerRegistryName
  location: location
  sku: {
    name: 'Basic'
  }
}

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2021-06-01' = {
  name: '${containerAppName}-law'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}
resource containerAppEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: '${containerAppName}-env'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsWorkspace.properties.customerId
        sharedKey: listKeys(logAnalyticsWorkspace.id, '2021-06-01').primarySharedKey
      }
    }
  }
}

resource userManagedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'containerAppManagedIdentity'
  location: location
}

resource roleAssignment 'Microsoft.Authorization/roleAssignments@2020-04-01-preview' = {
  name: guid(resourceGroup().id, userManagedIdentity.id, 'Contributor')
  scope: resourceGroup()
  properties: {
    roleDefinitionId: subscriptionResourceId(
      'Microsoft.Authorization/roleDefinitions',
      'b24988ac-6180-42a0-ab88-20f7382dd24c'
    ) // Contributor role
    principalId: userManagedIdentity.properties.principalId
  }
}

resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: containerAppName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userManagedIdentity.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: containerPort
      }
      registries: [
        {
          server: acr.properties.loginServer
          identity: userManagedIdentity.id
        }
      ]
    }
    template: {
      containers: [
        {
          name: containerAppName
          image: '${acr.name}.azurecr.io/${containerImage}'
          resources: {
            memory: '2Gi'
            cpu: 1
          }
          env: [
            {
              name: 'REACT_APP_API_URL'
              value: 'https://ca-api-gateway-prod-eus.grayforest-03a8c5c7.eastus.azurecontainerapps.io/item-info'
            }
          ]
        }
      ]
    }
  }
}
