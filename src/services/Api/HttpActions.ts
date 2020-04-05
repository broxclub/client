import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

type AsyncRequest<T> = Promise<AxiosResponse<T>>;

class HttpActions {
  private request: AxiosInstance;

  constructor(baseUrl: string) {
    const config = this.getConfig(baseUrl);

    this.request = axios.create(config);
    this.request.interceptors.response.use(
      response => response,
      response => this.parseError(response),
    );
  }

  public get<T>(url: string, params?: object, options?: AxiosRequestConfig): AsyncRequest<T> {
    return this.request.get(url, {
      params,
      ...this.runtimeOptions,
      ...options
    });
  }

  public post<T>(url: string, data?: any, options?: AxiosRequestConfig): AsyncRequest<T> {
    return this.request.post(url, data, {
      ...this.runtimeOptions,
      ...options
    });
  }

  public patch<T>(url: string, data?: any, options?: AxiosRequestConfig): AsyncRequest<T> {
    return this.request.patch(url, data, {
      ...this.runtimeOptions,
      ...options
    });
  }

  public del<T>(url: string, data?: any, params?: object, options?: AxiosRequestConfig): AsyncRequest<T> {
    return this.request.delete(url, {
      url,
      data,
      params,
      ...this.runtimeOptions,
      ...options
    });
  }

  public put<T>(url: string, data?: any, params?: object, options?: AxiosRequestConfig): AsyncRequest<T> {
    return this.request.put(url, data, {
      params,
      ...this.runtimeOptions,
      ...options
    });
  }

  private getConfig(baseURL: string): AxiosRequestConfig {
    return {
      baseURL,
      withCredentials: true,
      validateStatus: (status) => status >= 200 && status < 400,
    };
  }

  private get runtimeOptions(): AxiosRequestConfig {
    return {
      headers: {},
    };
  }

  private parseError(error: any) {
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (data.error) {
        throw new Error(data.error);
      }

      throw new Error(data);
    }
    throw new Error('Uncaught server error');
  }
}

export default HttpActions;
