import React from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  type Connection,
  type Edge,
  type Node,
  type NodeMouseHandler,
  type NodeTypes,
  type OnEdgesChange,
  type OnNodesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TableNode } from './TableNode';

const nodeTypes: NodeTypes = {
  table: TableNode,
};

interface DesignerCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node>;
  onEdgesChange: OnEdgesChange<Edge>;
  onConnect: (connection: Connection) => void;
  onNodeClick: NodeMouseHandler<Node>;
  onPaneClick: () => void;
}

export function DesignerCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onPaneClick
}: DesignerCanvasProps) {
  const isEmpty = nodes.length === 0;
  return (
    <div style={{ width: '100%', height: '100%' }} id="capture-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        {/* An empty minimap is just a dark box, so it appears with the first table. */}
        {!isEmpty && (
          <MiniMap
            zoomable
            pannable
            nodeColor="var(--border-emphasis)"
            nodeStrokeColor="var(--accent)"
            maskColor="var(--minimap-mask)"
          />
        )}
        <Background color="var(--border-emphasis)" gap={16} />
      </ReactFlow>
      {isEmpty && (
        <p className="canvas-empty-hint">Describe a database on the right and its tables appear here.</p>
      )}
    </div>
  );
}
