import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cache,
  initializeCache,
  preloadCachingFetch,
  serializeCache,
  useCachingFetch,
  wipeCache,
} from './cachingFetch';

const mockUrl = 'https://api.example.com/data';
const mockResponse = { message: 'hello world' };

describe('UseCachingFetch Tests', () => {
  describe('useCachingFetch', () => {
    beforeEach(() => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockResponse),
        }),
      ) as any;
    });

    afterEach(() => {
      wipeCache();
      vi.restoreAllMocks();
    });

    it('fetches data and sets loading state', async () => {
      const { result } = renderHook(() => useCachingFetch(mockUrl));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(null);

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.error).toBe(null);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('uses cached data on second call', async () => {
      // First call
      const first = renderHook(() => useCachingFetch(mockUrl));
      await waitFor(() => expect(first.result.current.isLoading).toBe(false));

      // Second call
      const second = renderHook(() => useCachingFetch(mockUrl));
      expect(second.result.current.data).toEqual(mockResponse);
      expect(second.result.current.isLoading).toBe(false);
      expect(global.fetch).toHaveBeenCalledTimes(1); // only one fetch call
    });

    it('handles fetch error correctly', async () => {
      const errorMessage = 'Fetch failed';
      global.fetch = vi.fn(() => Promise.reject(new Error(errorMessage))) as any;

      const { result } = renderHook(() => useCachingFetch(mockUrl));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(errorMessage);
      expect(result.current.data).toBe(null);
    });
  });

  describe('preloadCachingFetch', () => {
    beforeEach(() => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockResponse),
        }),
      ) as any;
    });

    afterEach(() => {
      wipeCache();
      vi.restoreAllMocks();
    });

    it('preloads and stores data in cache', async () => {
      await preloadCachingFetch(mockUrl);

      const serialized = serializeCache();
      const parsed = JSON.parse(serialized);

      expect(parsed[mockUrl]).toEqual({
        isLoading: false,
        data: mockResponse,
      });
    });
  });

  describe('serializeCache and initializeCache', () => {
    afterEach(() => {
      wipeCache();
    });

    it('serializes and restores cache correctly', () => {
      // manually put something in the cache
      const cachedData = { isLoading: false, data: { foo: 'bar' } };
      initializeCache(
        JSON.stringify({
          [mockUrl]: cachedData,
        }),
      );

      const serialized = serializeCache();
      const parsed = JSON.parse(serialized);

      expect(parsed[mockUrl]).toEqual(cachedData);
    });
  });

  describe('serializeCache validation', () => {
    afterEach(() => {
      wipeCache();
    });

    it('throws when serializing invalid cache entry', () => {
      // @ts-expect-error
      cache.set('invalid', { isLoading: 'yes', data: 123 });

      expect(() => serializeCache()).toThrowError(/Invalid cache entry for invalid/);
    });
  });

  it('initializes only valid entries', () => {
    const valid = JSON.stringify({
      one: { isLoading: false, data: { ok: true } },
    });

    initializeCache(valid);
    const serialized = serializeCache();
    const parsed = JSON.parse(serialized);
    expect(parsed.one).toEqual({ isLoading: false, data: { ok: true } });
  });
});
