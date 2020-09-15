window._genesys = {
    widgets: {
      main: {
        preload: ['webchat'],
      },
      webchat: {
        transport: {
          type: 'purecloud-v2-sockets',
          dataURL: 'https://api.mypurecloud.com',
          deploymentKey : '9ed966f3-166c-4b15-b496-3ffc023494f7',
          orgGuid : '988c610f-dea8-425d-9f79-be7f6316c58b',
          interactionData: {
            routing: {
              targetType: 'QUEUE',
              targetAddress: 'dfb93066-de90-4450-a5af-14cc0c611751',
              priority: 2
            }
          }
        },
        chatButton: {
          enabled: true,
        }
      }
    }
  };