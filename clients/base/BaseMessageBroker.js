class BaseMessageBroker {
    async connect() {
      throw new Error("connect() must be implemented");
    }
  
    async getChannel(queueName) {
      throw new Error("getChannel() must be implemented");
    }
  
    async send(queueName, message, options = {}) {
      throw new Error("send() must be implemented");
    }
  
    async close() {
      throw new Error("close() must be implemented");
    }
  }
  
  module.exports = BaseMessageBroker;
  