export interface Attribute {
  eq: string;
  id: 'label';
  type: 'attr';
}

export interface Edge {
  id: string;
  type: 'node_id';
}

export interface EdgeStatement {
  attr_list: Attribute[];
  edge_list: Edge[];
  type: 'edge_stmt';
}

export interface ParsedDotObject {
  children: EdgeStatement[];
  type: 'digraph';
}

export interface NodeEdgeCollection {
  nodes: {
    id: string;
  }[];
  edges: {
    source: string;
    label: string;
    target: string;
  }[];
}

const assignNodeIfDoesntExist = (
  nodes: NodeEdgeCollection['nodes'],
  node: {
    id: string;
  }
) => {
  const nodeAlreadyExists = !!nodes.filter(n => n.id === node.id).length;
  if (nodeAlreadyExists) {
    return;
  }
  nodes.push(node);
};

export default (dotObject: ParsedDotObject[]): NodeEdgeCollection => {
  return dotObject[0].children.reduce(
    (collections: NodeEdgeCollection, statement: EdgeStatement) => {
      statement.edge_list.forEach((edge: { id: string }) => {
        const node = {
          id: edge.id,
        };
        assignNodeIfDoesntExist(collections.nodes, node);
      });
      const edge = {
        source: statement.edge_list[0].id,
        target: statement.edge_list[1].id,
        label: statement.attr_list[0].eq,
      };
      collections.edges.push(edge);
      return collections;
    },
    {
      nodes: [],
      edges: [],
    }
  );
};
