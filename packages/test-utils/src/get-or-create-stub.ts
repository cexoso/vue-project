import type { SinonStub } from 'sinon';
import { stub } from 'sinon';

type StubHandler = unknown;
type key = number | string | symbol;

const instanceMap = new WeakMap<object, Map<key, StubHandler>>();

export function getOrCreateStub<T extends object, K extends keyof T>(service: T, name: K) {
  const getOrCreateInstanceMap = () => {
    let x = instanceMap.get(service);
    if (x === undefined) {
      x = new Map();
      instanceMap.set(service, x);
    }
    return x;
  };
  const methodMap = getOrCreateInstanceMap();
  const getOrCreateMethodStubhandler = (map: Map<key, StubHandler>) => {
    let x = map.get(name);
    if (x === undefined) {
      x = stub(service, name);
      map.set(name, x);
    }
    return x;
  };
  type Value = T[K];
  type Method = Value extends (i: infer I) => infer O ? (i: I) => O : never;
  type Req = Parameters<Method>;
  type Res = ReturnType<Method>;
  const stubMethod: unknown = getOrCreateMethodStubhandler(methodMap);

  return stubMethod as SinonStub<Req, Res>;
}
