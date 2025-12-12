/**
 * Enhanced logger utility for debugging API calls and authentication
 */
class Logger {
  private enabled: boolean = __DEV__;

  /**
   * Log API request
   */
  apiRequest(method: string, url: string, data?: any, headers?: any) {
    if (!this.enabled) return;

    console.log('\n🚀 API REQUEST ================');
    console.log(`📍 ${method} ${url}`);
    if (data) {
      console.log('📦 Data:', JSON.stringify(data, null, 2));
    }
    if (headers) {
      console.log('📋 Headers:', JSON.stringify(headers, null, 2));
    }
    console.log('================================\n');
  }

  /**
   * Log API response
   */
  apiResponse(method: string, url: string, status: number, data?: any) {
    if (!this.enabled) return;

    const emoji = status >= 200 && status < 300 ? '✅' : '❌';
    console.log(`\n${emoji} API RESPONSE ==============`);
    console.log(`📍 ${method} ${url}`);
    console.log(`🔢 Status: ${status}`);
    if (data) {
      console.log('📦 Response:', JSON.stringify(data, null, 2));
    }
    console.log('================================\n');
  }

  /**
   * Log API error
   */
  apiError(method: string, url: string, error: any) {
    if (!this.enabled) return;

    console.log('\n❌ API ERROR ==================');
    console.log(`📍 ${method} ${url}`);
    console.log('💥 Error:', error);
    console.log('================================\n');
  }

  /**
   * Log token operations
   */
  token(action: string, token?: string) {
    if (!this.enabled) return;

    console.log('\n🔐 TOKEN OPERATION ============');
    console.log(`🎯 Action: ${action}`);
    if (token) {
      // Show only first and last 10 characters for security
      const masked = token.length > 20
        ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}`
        : '***MASKED***';
      console.log(`🎫 Token: ${masked}`);
    }
    console.log('================================\n');
  }

  /**
   * Log WebView message
   */
  webViewMessage(type: string, data: any) {
    if (!this.enabled) return;

    console.log('\n📱 WEBVIEW MESSAGE ============');
    console.log(`📨 Type: ${type}`);
    console.log('📦 Data:', JSON.stringify(data, null, 2));
    console.log('================================\n');
  }

  /**
   * Log authentication state change
   */
  auth(action: string, user?: any) {
    if (!this.enabled) return;

    console.log('\n🔒 AUTH STATE CHANGE ==========');
    console.log(`🎯 Action: ${action}`);
    if (user) {
      console.log('👤 User:', JSON.stringify(user, null, 2));
    }
    console.log('================================\n');
  }

  /**
   * Generic info log
   */
  info(message: string, data?: any) {
    if (!this.enabled) return;

    console.log(`\nℹ️  ${message}`);
    if (data) {
      console.log('📦 Data:', JSON.stringify(data, null, 2));
    }
  }

  /**
   * Generic error log
   */
  error(message: string, error?: any) {
    if (!this.enabled) return;

    console.error(`\n❌ ${message}`);
    if (error) {
      console.error('💥 Error:', error);
    }
  }

  /**
   * Generic success log
   */
  success(message: string, data?: any) {
    if (!this.enabled) return;

    console.log(`\n✅ ${message}`);
    if (data) {
      console.log('📦 Data:', JSON.stringify(data, null, 2));
    }
  }
}

export default new Logger();
