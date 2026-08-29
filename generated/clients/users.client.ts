import type { HttpClient } from "../http-client.js";

import type { UserDto } from "../models/user-dto.js";
import type { CreateUserDto } from "../models/create-user-dto.js";

export class UsersClient {
  constructor(
    private readonly http: HttpClient,
    private readonly baseUrl: string
  ) {}

  async getUsers(  page?: number,
    pageSize?: number,
    search?: string,
    xCorrelationId?: string): Promise<UserDto[]> {
    const response = await this.http.request<UserDto[]>({
      method: "GET",
      url: `${this.baseUrl}/users`,
      query: {
        page,
        pageSize,
        search
      },
      headers: {
        ...(xCorrelationId !== undefined && {
          "X-Correlation-Id": xCorrelationId
        })
      }
    });

    return response.data;
  }

  async createUser(  request: CreateUserDto): Promise<UserDto> {
    const response = await this.http.request<UserDto>({
      method: "POST",
      url: `${this.baseUrl}/users`,
      body: request
    });

    return response.data;
  }

  async getUser(  id: number): Promise<UserDto> {
    const response = await this.http.request<UserDto>({
      method: "GET",
      url: `${this.baseUrl}/users/${id}`
    });

    return response.data;
  }
}
