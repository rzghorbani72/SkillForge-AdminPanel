import { ApiLayer19 } from './layers/19-process-affiliate-withdrawal';

class ApiClient extends ApiLayer19 {}

export const apiClient = new ApiClient();
