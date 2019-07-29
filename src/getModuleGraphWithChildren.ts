import { ModuleGraphNode, ModuleGraph } from "webpack-bundle-diff";

export interface ModuleGraphWithChildren {
  [id: string]: ModuleGraphNodeWithChildren;
}

export interface ModuleGraphNodeWithChildren extends ModuleGraphNode {
  id: number;
  children: string[];
  // Children in the same bundles
  dependants: string[];
  // Children not in the same bundles
  dependencies: string[];
}

const isSameBundle = (parent: ModuleGraphNodeWithChildren, child: ModuleGraphNodeWithChildren) => {
  const children = new Set(child.namedChunkGroups)
  return parent.namedChunkGroups.every(name => children.has(name));
}

let idCounter = 1;
/**
 * Builds a copy of a module graph tracking child information & with a unique ID associated
 * with each node in the graph.
 *
 * @param graph
 */
export function getModuleGraphWithChildren(
  graph: ModuleGraph
): ModuleGraphWithChildren {
  const newGraph: ModuleGraphWithChildren = {};
  const ensureNodeInNewGraph = (
    moduleName: string
  ): ModuleGraphNodeWithChildren | null => {
    let mod: ModuleGraphNodeWithChildren = newGraph[moduleName];
    if (mod === undefined) {
      if (!graph[moduleName]) {
        return null;
      }
      // copy the module from the original graph
      mod = JSON.parse(JSON.stringify(graph[moduleName]));
      mod.id = idCounter++;
      mod.children = [];
      mod.dependants = [];
      mod.dependencies = [];
      // add the new module to the new graph
      newGraph[moduleName] = mod;
    }
    return mod;
  };

  // Operate over sorted keys to ensure that the iteration order is consitent between runs.
  // This is to make sure the snapshot tests are sane.
  const moduleNames = Array.from(Object.keys(graph));
  moduleNames.sort();
  for (const moduleName of moduleNames) {
    const mod = ensureNodeInNewGraph(moduleName);
    if (mod === null) {
      continue;
    }
    const parentNames = mod.parents;
    parentNames.sort();
    parentNames.forEach(
      (parentModuleName: string): void => {
        const parentModule: ModuleGraphNodeWithChildren | null = ensureNodeInNewGraph(
          parentModuleName
        );
        if (parentModule === null) {
          return;
        }

        parentModule.children.push(moduleName);
        if (isSameBundle(parentModule, mod)) {
          parentModule.dependencies.push(moduleName);
          mod.dependants.push(parentModuleName);
        }
      }
    );
  }

  return newGraph;
}
