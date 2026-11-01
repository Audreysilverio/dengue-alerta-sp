import React from 'react';
import Icon from './Icon.jsx';
const nav = [
  { id: 'painel', label: 'Visão geral', icon: 'grid' },
  { id: 'mapa', label: 'Mapa territorial', icon: 'map' },
  { id: 'analises', label: 'Análises', icon: 'chart' },
  { id: 'tendencias', label: 'Tendências', icon: 'trend' },
  { id: 'prevencao', label: 'Prevenção', icon: 'shield' },
  { id: 'sobre', label: 'Sobre o projeto', icon: 'info' }
];
export default function Sidebar({ active, onNavigate, open, onClose }) {
  return <>
    {open && <button className="sidebar-backdrop" aria-label="Fechar menu" onClick={onClose} />}
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Icon name="drop" size={25}/></div><div><strong>Dengue<span>Alerta SP</span></strong><small>SAÚDE • TERRITÓRIO • DADOS</small></div></div>
      <div className="nav-label">PLATAFORMA</div>
      <nav className="nav-list" aria-label="Navegação principal">
        {nav.map(item => <button key={item.id} className={`nav-item ${active === item.id ? 'is-active' : ''}`} onClick={() => { onNavigate(item.id); onClose(); }}><Icon name={item.icon}/><span>{item.label}</span>{active === item.id && <span className="nav-active-dot"/>}</button>)}
      </nav>
      <div className="sidebar-bottom"><div className="status-dot"/><div><strong>Projeto acadêmico</strong><small>UNIVESP · Projeto Integrador</small></div></div>
      <div className="sidebar-foot">Informação para conscientização.<br/>Não substitui orientação médica.</div>
    </aside>
  </>;
}
