import fetch, { Response } from 'node-fetch';

import {
  HttpMethodConnect,
  HttpMethodDelete,
  HttpMethodGet,
  HttpMethodHead,
  HttpMethodOptions,
  HttpMethodPatch,
  HttpMethodPost,
  HttpMethodPut,
  HttpMethodTrace,
} from './const';

import { OK, MULTIPLE_CHOICES } from '@redmunroe/net-http';

type SuccessFailure<successType, failureType> = {
  success: successType;
  failure: failureType;
};

interface Query {
  [key: string]: string | number | boolean | undefined;
}

class QueryBuilder extends Object {
  query = {};
  constructor(query: Query) {
    super();
    this.query = query;
  }

  toString(): string {
    return Object.keys(this.query)
      .map((key) => `${key}=${this.query[key]}`)
      .join('&');
  }
}

type SlingOptions = {
  host: string;
  headers?: HeadersInit;
  query?: Query;
};

export default class Sling {
  private scheme: string = 'https';
  private host: string;
  private headers: HeadersInit;
  private query: QueryBuilder;
  private p: string = '';
  private m: string = '';
  private b: any = undefined;

  constructor(options: SlingOptions) {
    this.host = options.host;
    this.headers = options.headers;
    this.query = new QueryBuilder(options.query);
  }

  http(): Sling {
    this.scheme = 'http';
    return this;
  }

  path(path: string): Sling {
    this.p = path;
    return this;
  }

  private method(method: string): Sling {
    this.m = method;
    return this;
  }

  body(body: any): Sling {
    this.b = body;
    return this;
  }

  get(): Sling {
    return this.method(HttpMethodGet);
  }

  post(): Sling {
    return this.method(HttpMethodPost);
  }

  put(): Sling {
    return this.method(HttpMethodPut);
  }

  patch(): Sling {
    return this.method(HttpMethodPatch);
  }

  delete(): Sling {
    return this.method(HttpMethodDelete);
  }

  head(): Sling {
    return this.method(HttpMethodHead);
  }

  options(): Sling {
    return this.method(HttpMethodOptions);
  }

  trace(): Sling {
    return this.method(HttpMethodTrace);
  }

  connect(): Sling {
    return this.method(HttpMethodConnect);
  }

  async request<successType, failureType>(): Promise<
    SuccessFailure<successType, failureType>
  > {
    const resp: SuccessFailure<successType, failureType> = {
      success: undefined,
      failure: undefined,
    };
    const response = await this.send();

    if (this.isSuccess(response)) {
      resp.success = (await response.json()) as successType;
    } else {
      resp.failure = (await response.json()) as failureType;
    }

    return resp;
  }

  private isSuccess(resp: Response): boolean {
    return resp.status >= OK && resp.status < MULTIPLE_CHOICES;
  }

  private isFailure(resp: Response): boolean {
    return resp.status >= MULTIPLE_CHOICES;
  }

  async failureJSON<failureType>(): Promise<failureType | void> {
    const response = await this.send();
    if (this.isFailure(response)) {
      return response.json() as Promise<failureType>;
    }

    return;
  }

  async successJSON<successType>(): Promise<successType | void> {
    const response = await this.send();
    if (this.isSuccess(response)) {
      return response.json() as Promise<successType>;
    }

    return;
  }

  private buildURL(): string {
    const path = `${this.scheme}://${this.host}${this.p}`;
    if (this.query) {
      return `${path}?${this.query}`;
    }
    return path;
  }

  private async send(): Promise<Response> {
    const url = this.buildURL();
    const options = {
      method: this.m,
      headers: this.headers,
      body: this.b,
    };
    return fetch(url, options);
  }
}
