import { describe, expect, it, vi } from "vitest";

import { FetchHttpClient } from "../../src/runtime/fetch-http-client.js";

describe("FetchHttpClient", () => {
    it("should send GET request with query parameters", async () => {
        const fetchMock = vi
            .spyOn(globalThis, "fetch")
            .mockResolvedValue(
                new Response(
                    JSON.stringify([
                        {
                            id: 1,
                            name: "Abdallah"
                        }
                    ]),
                    {
                        status: 200,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                )
            );

        const client = new FetchHttpClient();

        const response =
            await client.request({
                method: "GET",
                url: "https://api.example.com/users",
                query: {
                    page: 1,
                    pageSize: 10,
                    search: "Abdallah"
                }
            });

        expect(fetchMock).toHaveBeenCalledWith(
            "https://api.example.com/users?page=1&pageSize=10&search=Abdallah",
            {
                method: "GET",
                headers: {},
                body: undefined
            }
        );

        expect(response.status).toBe(200);

        expect(response.data).toEqual([
            {
                id: 1,
                name: "Abdallah"
            }
        ]);

        fetchMock.mockRestore();
    });
    it("should throw HttpError for failed response", async () => {
        vi.spyOn(globalThis, "fetch")
            .mockResolvedValue(
                new Response(
                    JSON.stringify({
                        message: "User not found"
                    }),
                    {
                        status: 404,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                )
            );

        const client = new FetchHttpClient();

        await expect(
            client.request({
                method: "GET",
                url: "https://api.example.com/users/999"
            })
        ).rejects.toMatchObject({
            status: 404,
            data: {
                message: "User not found"
            }
        });

        vi.restoreAllMocks();
    });
});