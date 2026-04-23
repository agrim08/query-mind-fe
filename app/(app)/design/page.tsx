"use client";

import { useState, useCallback, useMemo } from 'react';
import { useNodesState, useEdgesState, addEdge, Connection, Edge, Node, ReactFlowProvider } from '@xyflow/react';
import { DesignerCanvas } from '@/components/design/DesignerCanvas';
import { DesignSidebar } from '@/components/design/DesignSidebar';
import { DesignHistory } from '@/components/design/DesignHistory';
import { exportCanvasToPDF, exportToSQL } from '@/lib/exportUtils';
import { generateSchema } from '@/lib/api';
import { History as HistoryIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DesignPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId), [nodes, selectedNodeId]);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true);
    try {
      const data = await generateSchema(prompt);
      loadSchemaToCanvas(data);
      toast.success("Database schema generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate schema");
    } finally {
      setIsGenerating(false);
    }
  };

  const loadSchemaToCanvas = (data: any) => {
    // Auto-layout simple spacing
    const newNodes = data.tables.map((table: any, index: number) => ({
      id: table.id,
      type: 'table',
      position: { x: (index % 3) * 350 + 100, y: Math.floor(index / 3) * 300 + 100 },
      data: table
    }));

    const newEdges = data.edges.map((edge: any) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: true,
      style: { stroke: 'var(--accent)' }
    }));

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const updateTableData = (nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          return { ...n, data: newData };
        }
        return n;
      })
    );
  };

  const handleExportSQL = () => {
    const rawTables = nodes.map(n => n.data);
    const sqlString = exportToSQL(rawTables, edges);
    
    // Download logic
    const blob = new Blob([sqlString], { type: 'text/sql' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'schema.sql';
    a.click();
    toast.success("SQL downloaded");
  };

  const handleExportPDF = () => {
    toast.loading("Generating PDF...", { id: "export-pdf" });
    exportCanvasToPDF("capture-canvas").then(() => {
      toast.success("PDF saved", { id: "export-pdf" });
    }).catch(() => {
      toast.error("Failed to generate PDF", { id: "export-pdf" });
    });
  };

  return (
    <div style={{ display: 'flex', height: '100%', flexDirection: 'column', overflow: 'hidden' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-panel)' }}>
        <h1 className="font-heading" style={{ fontSize: 20 }}>DB Designer</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setIsHistoryOpen(!isHistoryOpen)}>
            <HistoryIcon size={14} style={{ marginRight: 6 }} /> History
          </button>
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={handleExportPDF}
            disabled={nodes.length === 0}
            style={{ opacity: nodes.length === 0 ? 0.5 : 1, cursor: nodes.length === 0 ? 'not-allowed' : 'pointer' }}
          >
            Export PDF
          </button>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={handleExportSQL}
            disabled={nodes.length === 0}
            style={{ opacity: nodes.length === 0 ? 0.5 : 1, cursor: nodes.length === 0 ? 'not-allowed' : 'pointer' }}
          >
            Export SQL
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <ReactFlowProvider>
            <DesignerCanvas 
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(_, node) => setSelectedNodeId(node.id)}
              onPaneClick={() => setSelectedNodeId(null)}
            />
          </ReactFlowProvider>
        </div>

        <DesignSidebar 
          selectedNode={selectedNode}
          onGenerate={handleGenerate}
          onUpdateTable={updateTableData}
          onNewDesign={() => {
            setNodes([]);
            setEdges([]);
            setSelectedNodeId(null);
            toast.success("Started new design");
          }}
          isGenerating={isGenerating}
          hasNodes={nodes.length > 0}
        />

        {isHistoryOpen && (
          <div 
            onClick={() => setIsHistoryOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 999,
              animation: 'fadeIn 0.3s ease-out'
            }}
          />
        )}

        <DesignHistory 
          isOpen={isHistoryOpen} 
          onClose={() => setIsHistoryOpen(false)} 
          onLoadDesign={(schema) => {
            loadSchemaToCanvas(schema);
            setIsHistoryOpen(false);
            toast.success("Design loaded from history");
          }}
        />
      </div>
    </div>
  );
}
