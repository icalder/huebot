export function hydrate<T extends object>(constr: { new(...args: any[]): T }, data: string, ...args: any[]): T {
  const obj = JSON.parse(data)
  const instance = new constr(...args)
  Object.assign(instance, obj)
  return instance;
}

export function hydrateArray<T extends object>(constr: { new(...args: any[]): T }, data: string, ...args: any[]): T[] {
  const objs = JSON.parse(data)
  const result: T[] = []
  for (const obj of objs) {
    const instance = new constr(...args)
    Object.assign(instance, obj)
    result.push(instance)
  }  
  return result
}

export function flattenGetters<T>(tgt: any): T {
  const result = {} as Record<string, any>
  for (const [prop, pd] of Object.entries(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(tgt)))) {
    console.log(prop)
    if (pd.get) {
      const value = pd.get.call(tgt)
      result[prop] = value
    }
  }
  return result as T
}