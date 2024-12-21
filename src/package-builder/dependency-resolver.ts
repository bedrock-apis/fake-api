import { Kernel } from '../api-builder/kernel';

interface Dependable<T> {
   id: string;
   dependencies: string[];
   value: T;
}

export function resolveDependencies<T>(dependables: Dependable<T>[]): T[] {
   const resolvedDependables = Kernel.Construct('Set') as Set<Dependable<T>>;
   const visitedDependables = Kernel.Construct('Set') as Set<Dependable<T>>;

   function resolve(parents: Dependable<T>[], dependable: Dependable<T>) {
      if (resolvedDependables.has(dependable)) return;
      if (visitedDependables.has(dependable)) {
         throw Kernel.Construct(
            'Error',
            `Circular dependency detected! ${parents
               .map(e => e.id)
               .concat(dependable.id)
               .join(' -> ')}`,
         );
      }
      visitedDependables.add(dependable);

      for (const dependency of dependables.filter(e => dependable.dependencies.includes(e.id))) {
         resolve(parents.concat(dependable), dependency);
      }

      resolvedDependables.add(dependable);
   }

   for (const dependable of dependables) {
      resolve(Kernel.Construct('Array') as Dependable<T>[], dependable);
   }

   return Kernel['Array::static'].from(resolvedDependables).map(e => e.value);
}
