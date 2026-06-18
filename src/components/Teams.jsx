import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './Teams.css';

const fallbackData = [
  { year: '2024', name: 'SELECCIÓN MUNICIPAL', image: '/images/team_action_1_1781810335986.png' },
  { year: '2024', name: 'FUTSAL CENTRO', image: '/images/team_action_2_1781810347262.png' },
  { year: '2024', name: 'ACADEMIA JUVENIL', image: '/images/team_action_1_1781810335986.png' },
  { year: '2025', name: 'HALCONES FC', image: '/images/team_action_2_1781810347262.png' },
];

const Teams = () => {
  const scrollRef = useRef(null);
  const [teamsData, setTeamsData] = useState([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data, error } = await supabase.from('teams').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        
        if (data && data.length > 0) {
          setTeamsData(data);
        } else {
          setTeamsData(fallbackData);
        }
      } catch (err) {
        console.error(err);
        setTeamsData(fallbackData);
      }
    };
    fetchTeams();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="section teams-section" id="equipos">
      <div className="container">
        <div className="teams-header">
          <div className="teams-header-text">
            <span className="subtitle">TRABAJOS</span>
            <h2>EQUIPOS QUE CONFÍAN</h2>
            <p>Algunos de los equipos que ya visten Esma Sportwear.</p>
          </div>
          <div className="teams-nav-buttons">
            <button className="nav-btn" onClick={() => scroll('left')}>
              <ArrowLeft size={20} strokeWidth={1} color="#fff" />
            </button>
            <button className="nav-btn" onClick={() => scroll('right')}>
              <ArrowRight size={20} strokeWidth={1} color="#fff" />
            </button>
          </div>
        </div>
      </div>

      <div className="teams-carousel-container">
        <div className="teams-carousel" ref={scrollRef}>
          {teamsData.map((team, index) => (
            <div className="team-card" key={index} style={{ backgroundImage: `url(${team.image})` }}>
              <div className="team-card-overlay">
                <div className="team-card-info">
                  <span className="team-year">{team.year}</span>
                  <h3>{team.name}</h3>
                </div>
                <div className="team-esma-badge">ESMA</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Teams;
