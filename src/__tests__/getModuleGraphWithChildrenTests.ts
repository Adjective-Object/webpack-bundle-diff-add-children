import { ModuleGraph } from "webpack-bundle-diff";
import { getGraphWithChilren } from "../getModuleGraphWithChildren";

describe("getGraphWithChilren", () => {
  it("assigns unique IDs to all modules in the new graph", () => {
    const testGraph: ModuleGraph = {
      "lib/foo": {
        namedChunkGroups: ["Mail", "Fake"],
        name: "foo-graph",
        parents: [],
        size: 10
      },
      "lib/bar": {
        namedChunkGroups: ["Mail", "Fake"],
        name: "bar-graph",
        parents: [],
        size: 10
      }
    };

    const childGraph = getGraphWithChilren(testGraph);

    expect(childGraph["lib/foo"].id).toBeDefined();
    expect(childGraph["lib/bar"].id).toBeDefined();
    expect(childGraph["lib/foo"].id).not.toEqual(childGraph["lib/bar"].id);
  });

  it("replicates parent relationships as children", () => {
    const testGraph: ModuleGraph = {
      "lib/foo": {
        namedChunkGroups: ["Mail", "Fake"],
        name: "foo-graph",
        parents: ["lib/bar", "lib/baz"],
        size: 10
      },
      "lib/bar": {
        namedChunkGroups: ["Mail", "Fake"],
        name: "bar-graph",
        parents: ["lib/baz"],
        size: 10
      },
      "lib/baz": {
        namedChunkGroups: ["Mail", "Fake"],
        name: "bar-graph",
        parents: [],
        size: 10
      }
    };

    const childGraph = getGraphWithChilren(testGraph);

    expect(childGraph["lib/foo"].children).toEqual([]);
    expect(childGraph["lib/bar"].children).toEqual(["lib/foo"]);
    expect(childGraph["lib/baz"].children).toEqual(
      jasmine.arrayContaining(["lib/foo", "lib/bar"])
    );
    expect(childGraph["lib/baz"].children.length).toBe(2);
  });

  it("does not mutate the input graph", () => {
    const testGraph: ModuleGraph = {
      "lib/foo": {
        namedChunkGroups: ["Mail", "Fake"],
        name: "foo-graph",
        parents: ["lib/bar", "lib/foo"],
        size: 10
      },
      "lib/bar": {
        namedChunkGroups: ["Mail", "Fake"],
        name: "bar-graph",
        parents: ["lib/foo"],
        size: 10
      },
      "lib/baz": {
        namedChunkGroups: ["Mail", "Fake"],
        name: "bar-graph",
        parents: [],
        size: 10
      }
    };
    const testGraphClone: ModuleGraph = JSON.parse(JSON.stringify(testGraph));

    getGraphWithChilren(testGraph);

    expect(testGraph).toEqual(testGraphClone);
  });

  it("does not crash on a cyclical graph", () => {
    const testGraph: ModuleGraph = {
      "lib/foo": {
        namedChunkGroups: ["Mail", "Fake"],
        name: "foo-graph",
        parents: ["lib/bar"],
        size: 10
      },
      "lib/bar": {
        namedChunkGroups: ["Mail", "Fake"],
        name: "bar-graph",
        parents: ["lib/foo"],
        size: 10
      }
    };

    const childGraph = getGraphWithChilren(testGraph);

    expect(childGraph["lib/foo"].children).toEqual(["lib/bar"]);
    expect(childGraph["lib/bar"].children).toEqual(["lib/foo"]);
  });
});
