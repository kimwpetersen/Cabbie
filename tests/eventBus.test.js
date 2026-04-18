import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventBus } from '../src/eventBus.js';

describe('EventBus', () => {
  beforeEach(() => {
    EventBus._reset();
  });

  it('delivers emitted events to subscribed handlers', () => {
    const spy = vi.fn();
    EventBus.on('test:event', spy);
    EventBus.emit('test:event', { value: 42 });
    expect(spy).toHaveBeenCalledWith({ value: 42 });
  });

  it('delivers to multiple handlers in subscription order', () => {
    const calls = [];
    EventBus.on('x', () => calls.push('a'));
    EventBus.on('x', () => calls.push('b'));
    EventBus.emit('x');
    expect(calls).toEqual(['a', 'b']);
  });

  it('on() returns an unsubscribe function', () => {
    const spy = vi.fn();
    const off = EventBus.on('x', spy);
    off();
    EventBus.emit('x');
    expect(spy).not.toHaveBeenCalled();
  });

  it('off() removes a specific handler', () => {
    const spy1 = vi.fn();
    const spy2 = vi.fn();
    EventBus.on('x', spy1);
    EventBus.on('x', spy2);
    EventBus.off('x', spy1);
    EventBus.emit('x');
    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });

  it('does not throw when emitting to an event with no listeners', () => {
    expect(() => EventBus.emit('no:listeners')).not.toThrow();
  });

  it('isolates errors in one handler from other handlers', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const goodSpy = vi.fn();
    EventBus.on('x', () => { throw new Error('boom'); });
    EventBus.on('x', goodSpy);
    EventBus.emit('x');
    expect(goodSpy).toHaveBeenCalled();
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('passes undefined payload cleanly to handlers', () => {
    const spy = vi.fn();
    EventBus.on('x', spy);
    EventBus.emit('x');
    expect(spy).toHaveBeenCalledWith(undefined);
  });
});
