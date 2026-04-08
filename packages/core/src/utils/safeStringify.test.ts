/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { safeStringify } from './safeStringify.js';

describe('safeStringify', () => {
  describe('normal objects', () => {
    it('should stringify simple objects', () => {
      const obj = { foo: 'bar', num: 42 };
      const result = safeStringify(obj);
      expect(JSON.parse(result)).toEqual(obj);
    });

    it('should stringify nested objects', () => {
      const obj = {
        user: {
          name: 'Alice',
          address: {
            city: 'Beijing',
            district: 'Chaoyang',
          },
        },
      };
      const result = safeStringify(obj);
      expect(JSON.parse(result)).toEqual(obj);
    });

    it('should stringify arrays', () => {
      const arr = [1, 2, { name: 'test' }];
      const result = safeStringify(arr);
      expect(JSON.parse(result)).toEqual(arr);
    });
  });

  describe('circular references', () => {
    it('should handle direct circular references', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const obj: any = { name: 'test' };
      obj.self = obj;

      const result = safeStringify(obj);
      expect(result).toContain('"name":"test"');
      expect(result).toContain('"self":"[Circular]"');
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should handle nested circular references', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parent: any = { name: 'parent' };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const child: any = { name: 'child', parent };
      parent.child = child;

      const result = safeStringify(parent);
      expect(result).toContain('"name":"parent"');
      expect(result).toContain('"name":"child"');
      expect(result).toContain('"parent":"[Circular]"');
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should handle complex circular reference structures', () => {
      // Simulate HttpsProxyAgent-like structure
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const circularObject: any = {
        sockets: {},
        agent: null,
      };
      circularObject.agent = circularObject;
      circularObject.sockets['test-host'] = [
        { _httpMessage: { agent: circularObject } },
      ];

      const result = safeStringify(circularObject);
      expect(result).toContain('"sockets"');
      expect(result).toContain('"agent":"[Circular]"');
      expect(() => JSON.parse(result)).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle null', () => {
      expect(safeStringify(null)).toBe('null');
    });

    it('should handle undefined with fallback', () => {
      expect(safeStringify(undefined)).toBe('{}');
      expect(safeStringify(undefined, 'null')).toBe('null');
    });

    it('should handle empty objects', () => {
      expect(safeStringify({})).toBe('{}');
    });

    it('should handle empty arrays', () => {
      expect(safeStringify([])).toBe('[]');
    });
  });

  describe('non-serializable values', () => {
    it('should omit functions', () => {
      const obj = {
        name: 'test',
        fn: () => console.log('hello'),
      };
      const result = safeStringify(obj);
      const parsed = JSON.parse(result);
      expect(parsed.name).toBe('test');
      expect(parsed.fn).toBeUndefined();
    });

    it('should omit symbols', () => {
      const obj = {
        name: 'test',
        sym: Symbol('test'),
      };
      const result = safeStringify(obj);
      const parsed = JSON.parse(result);
      expect(parsed.name).toBe('test');
      expect(parsed.sym).toBeUndefined();
    });

    it('should handle mixed serializable and non-serializable', () => {
      const obj = {
        valid: 'string',
        number: 42,
        nested: { ok: true },
        fn: () => {},
        sym: Symbol('test'),
      };
      const result = safeStringify(obj);
      const parsed = JSON.parse(result);
      expect(parsed.valid).toBe('string');
      expect(parsed.number).toBe(42);
      expect(parsed.nested).toEqual({ ok: true });
      expect(parsed.fn).toBeUndefined();
      expect(parsed.sym).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should use fallback value on error', () => {
      // This shouldn't happen with our implementation, but test the fallback
      const result = safeStringify({ test: 'value' }, '{"fallback":true}');
      expect(JSON.parse(result)).toEqual({ test: 'value' });
    });
  });

  describe('real-world scenarios', () => {
    it('should handle tool call arguments with circular references', () => {
      // Simulate a tool call with circular references in args
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const args: any = {
        filePath: '/path/to/file.txt',
        encoding: 'utf8',
        options: {
          create: true,
          recursive: true,
        },
      };

      // Add circular reference
      args.options.parent = args;

      const result = safeStringify(args);
      expect(result).toContain('"filePath":"/path/to/file.txt"');
      expect(result).toContain('"encoding":"utf8"');
      expect(result).toContain('"options"');
      expect(result).toContain('"parent":"[Circular]"');
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should handle network-related objects', () => {
      // Simulate a network socket-like object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const socket: any = {
        remoteAddress: '127.0.0.1',
        remotePort: 8080,
        localAddress: '127.0.0.1',
        localPort: 3000,
      };

      // Add circular reference like real sockets have
      socket._parent = socket;

      const result = safeStringify(socket);
      expect(result).toContain('"remoteAddress":"127.0.0.1"');
      expect(result).toContain('"remotePort":8080');
      expect(result).toContain('"_parent":"[Circular]"');
      expect(() => JSON.parse(result)).not.toThrow();
    });
  });
});
