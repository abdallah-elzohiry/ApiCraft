export interface RefResolver {
  resolve<T = unknown>(
    ref: string
  ): T;
}