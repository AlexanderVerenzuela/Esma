import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { supabase, getTenantId, getTenantSlug } from '../supabaseClient';
import EditableText from './editor/EditableText';
import './Teams.css';

const fallbackData = [
  { year: '2024', name: 'SELECCIÓN MUNICIPAL', image: '/images/team_action_1_1781810335986.png' },
  { year: '2024', name: 'FUTSAL CENTRO', image: '/images/team_action_2_1781810347262.png' },
  { year: '2024', name: 'ACADEMIA JUVENIL', image: '/images/team_action_1_1781810335986.png' },
  { year: '2025', name: 'HALCONES FC', image: '/images/team_action_2_1781810347262.png' },
];

const Teams = () => {
  const [teamsData, setTeamsData] = useState([]);
  const sectionRef = useRef(null);
  const [tenantSlug, setTenantSlug] = useState('default');
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'center', 
    skipSnaps: false,
    dragFree: false
  });

  useGSAP(() => {
    gsap.fromTo('.teams-header-text > *', 
      { x: -50, opacity: 0 },
      {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        x: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
      }
    );

    gsap.fromTo('.embla', 
      { y: 50, opacity: 0 },
      {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power2.out',
        delay: 0.3
      }
    );
  }, { scope: sectionRef });

  useEffect(() => {
    setTenantSlug(getTenantSlug());
    const fetchTeams = async () => {
      try {
        const tenantId = await getTenantId();
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false });
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

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const autoplayInterval = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000); 
    return () => clearInterval(autoplayInterval);
  }, [emblaApi]);

  return (
    <section className="section teams-section" id="equipos" ref={sectionRef}>
      <div className="container">
        <div className="teams-header">
          <div className="teams-header-text">
            <span className="subtitle"><EditableText id="teams_tag" defaultText="TRABAJOS" /></span>
            <EditableText id="teams_title" defaultText="EQUIPOS QUE CONFÍAN" as="h2" />
            <EditableText id="teams_desc" defaultText="Algunos de los equipos que ya visten nuestra marca." as="p" />
          </div>
          <div className="teams-nav-buttons">
            <button className="carousel-nav-btn" onClick={scrollPrev}>
              <ArrowLeft size={20} strokeWidth={1} color="#fff" />
            </button>
            <button className="carousel-nav-btn" onClick={scrollNext}>
              <ArrowRight size={20} strokeWidth={1} color="#fff" />
            </button>
          </div>
        </div>
      </div>

      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {teamsData.map((team, index) => (
            <div className="embla__slide" key={`${team.id || team.name}-${index}`}>
              <div 
                className="team-card" 
                style={{ backgroundImage: `url(${team.image})` }}
              >
                <div className="team-card-overlay">
                  <div className="team-card-info">
                    <span className="team-year">{team.year}</span>
                    <h3>{team.name}</h3>
                  </div>
                  <div className="team-esma-badge">{tenantSlug === 'demo' ? 'DEMO' : 'ESMA'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Teams;
