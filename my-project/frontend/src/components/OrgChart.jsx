/**
 * OrgChart Component
 * Interactive organizational chart visualization using D3.js
 * For GIAS Industries with distinction for shared departments
 */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import departementService from '../services/departementService';

const OrgChart = ({ onNodeClick, entity = 'GIAS' }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentEntity, setCurrentEntity] = useState(entity);

  // Colors for different entity types
  const COLORS = {
    GIAS: '#007bff',      // Primary blue
    CSM: '#28a745',        // Green
    SHARED: '#6f42c1',     // Purple
    default: '#6c757d'     // Gray
  };

  // Fetch organization data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const treeData = await departementService.getDepartementsTree(currentEntity);
        
        // Transform to D3 hierarchy format if needed
        if (treeData && treeData.length > 0) {
          setData({
            nom: currentEntity === 'CSM' ? 'CSM GIAS' : 'GIAS Industries',
            code: currentEntity,
            entity: currentEntity,
            children: treeData
          });
        } else {
          setData(null);
        }
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement de l\'organigramme');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentEntity]);

  // Handle entity prop change
  useEffect(() => {
    setCurrentEntity(entity);
  }, [entity]);

  // Render D3 chart
  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 600;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create a group for zoom/pan
    const g = svg.append('g')
      .attr('class', 'chart-group');

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create hierarchy
    const root = d3.hierarchy(data);

    // Create tree layout
    const treeLayout = d3.tree()
      .nodeSize([180, 120])
      .separation((a, b) => a.parent === b.parent ? 1.2 : 1.5);

    treeLayout(root);

    // Center the chart initially
    const initialTransform = d3.zoomIdentity
      .translate(width / 2, 60)
      .scale(0.8);
    svg.call(zoom.transform, initialTransform);

    // Draw links
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 2)
      .attr('d', d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y)
      );

    // Draw nodes
    const nodes = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        if (onNodeClick) {
          onNodeClick(d.data);
        }
      });

    // Node rectangle
    nodes.append('rect')
      .attr('width', 160)
      .attr('height', 70)
      .attr('x', -80)
      .attr('y', -35)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', d => {
        if (d.data.entity === 'SHARED') return COLORS.SHARED;
        if (d.data.entity === 'GIAS') return COLORS.GIAS;
        return COLORS.default;
      })
      .attr('stroke', d => d._children ? '#333' : '#fff')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');

    // Department name
    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -5)
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(d => d.data.nom.length > 18 
        ? d.data.nom.substring(0, 16) + '...' 
        : d.data.nom);

    // Department code
    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 15)
      .attr('fill', 'rgba(255,255,255,0.8)')
      .attr('font-size', '10px')
      .text(d => d.data.code || '');

    // Shared department badge
    nodes.filter(d => d.data.entity === 'SHARED')
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 30)
      .attr('fill', 'rgba(255,255,255,0.9)')
      .attr('font-size', '8px')
      .attr('font-weight', 'bold')
      .text('PARTAGÉ');

    // Responsible name (if available)
    nodes.filter(d => d.data.responsable)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 50)
      .attr('fill', 'rgba(255,255,255,0.7)')
      .attr('font-size', '9px')
      .text(d => {
        const resp = d.data.responsable;
        return resp ? `${resp.prenom} ${resp.nom}`.substring(0, 20) : '';
      });

    // Expand/collapse indicator
    nodes.filter(d => d.children || d._children)
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 45)
      .attr('r', 8)
      .attr('fill', '#fff')
      .attr('stroke', '#333')
      .attr('stroke-width', 1)
      .on('click', function(event, d) {
        event.stopPropagation();
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        // Trigger re-render
        setData({ ...data });
      });

    nodes.filter(d => d.children || d._children)
      .append('text')
      .attr('x', 0)
      .attr('y', 48)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#333')
      .text(d => d.children ? '−' : '+');

  }, [data, onNodeClick]);

  // Export to PNG
  const exportToPNG = async () => {
    if (!containerRef.current) return;
    
    try {
      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: '#f5f5f5',
        scale: 2
      });
      
      const link = document.createElement('a');
      link.download = 'organigramme-gias.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error exporting to PNG:', err);
    }
  };

  // Export to PDF
  const exportToPDF = async () => {
    if (!containerRef.current) return;
    
    try {
      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: '#f5f5f5',
        scale: 2
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, (canvas.height * (pdfWidth - 20)) / canvas.width);
      pdf.save('organigramme-gias.pdf');
    } catch (err) {
      console.error('Error exporting to PDF:', err);
    }
  };

  if (loading) {
    return (
      <div className="org-chart-loading">
        <div className="spinner"></div>
        <p>Chargement de l'organigramme...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="org-chart-error">
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="org-chart-empty">
        <p>Aucun département à afficher</p>
      </div>
    );
  }

  return (
    <div className="org-chart-container">
      <div className="org-chart-toolbar">
        <button className="btn btn-sm btn-secondary" onClick={exportToPNG}>
          Exporter PNG
        </button>
        <button className="btn btn-sm btn-secondary" onClick={exportToPDF}>
          Exporter PDF
        </button>
        <div className="entity-switcher">
          <button 
            className={`btn btn-sm ${currentEntity === 'GIAS' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setCurrentEntity('GIAS')}
          >
            GIAS
          </button>
          <button 
            className={`btn btn-sm ${currentEntity === 'CSM' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setCurrentEntity('CSM')}
          >
            CSM
          </button>
        </div>
        <div className="org-chart-legend">
          <span className="legend-item">
            <span className="legend-color" style={{ backgroundColor: COLORS.GIAS }}></span>
            GIAS
          </span>
          <span className="legend-item">
            <span className="legend-color" style={{ backgroundColor: COLORS.CSM }}></span>
            CSM
          </span>
          <span className="legend-item">
            <span className="legend-color" style={{ backgroundColor: COLORS.SHARED }}></span>
            Partagé
          </span>
        </div>
      </div>
      <div className="org-chart-viewport" ref={containerRef}>
        <svg ref={svgRef}></svg>
      </div>
      <p className="org-chart-hint">
        Utilisez la molette pour zoomer, cliquez et glissez pour déplacer
      </p>
    </div>
  );
};

export default OrgChart;
