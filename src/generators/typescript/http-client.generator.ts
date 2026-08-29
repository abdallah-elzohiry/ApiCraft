import { writeFile } from "node:fs/promises";
import path from "node:path";

export async function generateHttpClient(
    outputDirectory: string
): Promise<void> {
    const content = `export interface HttpRequest {
  method: string;
  url: string;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

export interface HttpResponse<T = unknown> {
  status: number;
  headers: Record<string, string>;
  data: T;
}

export interface HttpClient {
  request<T>(
    request: HttpRequest
  ): Promise<HttpResponse<T>>;
}
`;

    await writeFile(
        path.join(
            outputDirectory,
            "http-client.ts"
        ),
        content,
        "utf8"
    );
}