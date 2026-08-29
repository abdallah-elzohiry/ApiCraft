export class HttpError<T = unknown>
  extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data: T,
    public readonly headers: Record<string, string>
  ) {
    super(message);

    this.name = "HttpError";
  }
}