import React from 'react';
export function LineChart({ data, dataKey = 'casos', color = '#2e8271', secondKey, secondColor = '#e3a24f', labels = true }) {
  const width = 680, height = 220, left = 34, right = 16, top = 16, bottom = 34;
  const plotW = width - left - right, plotH = height - top - bottom;
  const max = Math.max(...data.map(d => Math.max(d[dataKey] || 0, secondKey ? d[secondKey] || 0 : 0)), 1) * 1.15;
  const points = key => data.map((d, i) => `${left + (i / Math.max(data.length - 1, 1)) * plotW},${top + plotH - ((d[key] || 0) / max) * plotH}`).join(' ');
  const area = `${left},${top + plotH} ${points(dataKey)} ${left + plotW},${top + plotH}`;
  return <div className="chart-wrap"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Gráfico de evolução mensal">
    {[0, .25, .5, .75, 1].map((v,i) => <g key={i}><line x1={left} x2={width-right} y1={top+plotH*v} y2={top+plotH*v} className="chart-grid"/><text x={left-9} y={top+plotH*v+4} textAnchor="end" className="chart-axis">{Math.round(max*(1-v))}</text></g>)}
    <polygon points={area} fill={color} opacity=".09"/><polyline points={points(dataKey)} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    {secondKey && <polyline points={points(secondKey)} fill="none" stroke={secondColor} strokeWidth="2.5" strokeDasharray="6 5" strokeLinecap="round"/>}
    {data.map((d,i) => <g key={d.mes}><circle cx={left+(i/Math.max(data.length-1,1))*plotW} cy={top+plotH-((d[dataKey]||0)/max)*plotH} r="3.5" fill={color} stroke="#fff" strokeWidth="1.5"/><text x={left+(i/Math.max(data.length-1,1))*plotW} y={height-10} textAnchor="middle" className="chart-axis">{labels ? d.mes : ''}</text></g>)}
  </svg></div>;
}
export function BarChart({ data, dataKey = 'chuva' }) {
  const max = Math.max(...data.map(d => d[dataKey] || 0), 1);
  return <div className="bar-chart">{data.map(d => <div className="bar-col" key={d.mes}><span className="bar-value">{d[dataKey]}</span><div className="bar-track"><div className="bar-fill" style={{ height: `${(d[dataKey] / max) * 100}%` }}/></div><span className="bar-label">{d.mes}</span></div>)}</div>;
}
