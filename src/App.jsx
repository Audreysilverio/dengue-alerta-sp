import React, { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Icon from './components/Icon.jsx';
import Dashboard from './pages/Dashboard.jsx';
import GenericPage from './pages/GenericPage.jsx';
const titles = { painel:'Visão geral', mapa:'Mapa territorial', analises:'Análises', tendencias:'Tendências', prevencao:'Prevenção', sobre:'Sobre o projeto' };
export default function App() {
  const [active, setActive] = useState('painel');
  const [year, setYear] = useState('2026');
  const [area, setArea] = useState('Parque Vila Maria e entorno');
  const [mobileMenu, setMobileMenu] = useState(false);
  return <div className="app-shell">
    <Sidebar active={active} onNavigate={setActive} open={mobileMenu} onClose={()=>setMobileMenu(false)}/>
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu-button" onClick={()=>setMobileMenu(true)} aria-label="Abrir menu"><Icon name="menu"/></button><span className="breadcrumb">Dengue Alerta SP <span>/</span> <strong>{titles[active]}</strong></span></div><div className="topbar-right"><span className="topbar-status"><i/> Protótipo acadêmico</span><div className="avatar">DA</div></div></header>
      <div className="page-content">{active === 'painel' ? <Dashboard onNavigate={setActive} year={year} setYear={setYear} area={area} setArea={setArea}/> : <GenericPage page={active} onNavigate={setActive} year={year} area={area}/>}</div>
    </main>
  </div>;
}
