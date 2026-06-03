import React from 'react';
import { useState, useEffect } from 'react';
import WealthSmartBG from '../assets/WealthSmartBG.png';
import WealthSmartIcon from '../assets/WealthSmartIcon.png';
import HomePageBG from '../assets/WealthSmartBG2.jpg';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import icons for cards
import { MdDashboard, MdReceipt, MdCalculate, MdList } from 'react-icons/md';

export default function Homepage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [flippedCard, setFlippedCard] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigation cards data - removed solidColor, will use theme classes
  const navCards = [
    {
      title: 'Dashboard',
      description: 'View your financial overview, track spending patterns, and monitor your financial health with real-time analytics and insights.',
      path: '/dashboard',
      icon: <MdDashboard className="text-5xl" />
    },
    {
      title: 'Transactions',
      description: 'Record, categorize, and manage all your financial transactions. Track income, expenses, and view detailed transaction history.',
      path: '/transactions',
      icon: <MdReceipt className="text-5xl" />
    },
    {
      title: 'Budget Estimator',
      description: 'Plan your monthly budget, set spending limits for different categories, and get AI-powered recommendations for better savings.',
      path: '/budget-estimator',
      icon: <MdCalculate className="text-5xl" />
    },
    {
      title: 'Budget Estimates',
      description: 'Review and manage your saved budget plans, compare actual spending against estimates, and adjust future budgets accordingly.',
      path: '/budget-estimates',
      icon: <MdList className="text-5xl" />
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Add global styles for card flip */}
      <style>{`
        .card-container {
          perspective: 1000px;
        }
        .card-flipper {
          transition: transform 0.6s;
          transform-style: preserve-3d;
          position: relative;
        }
        .card-flipper.flipped {
          transform: rotateY(180deg);
        }
        .card-front, .card-back {
          backface-visibility: hidden;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
        .card-back {
          transform: rotateY(180deg);
        }
      `}</style>

      {isMobile ? (
        // Mobile Layout
        <div className="min-h-screen bg-background pb-8 ">
          {/* Hero Section */}
          <div className="relative h-[35vh] bg-secondary-darkest/90 -top-[4em] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-secondary/50"
              style={{
                maskImage: `url(${WealthSmartBG})`,
                maskSize: 'cover',
                maskPosition: 'center',
                maskRepeat: 'no-repeat',
              }}
            />
            <div className="relative z-10 text-center px-4">
              <div className="w-24 h-24 mx-auto mb-4">
                <div
                  className="bg-primary-lightest"
                  style={{
                    maskImage: `url(${WealthSmartIcon})`,
                    maskSize: 'contain',
                    maskPosition: 'center',
                    maskRepeat: 'no-repeat',
                    width: '100%',
                    height: '100%',
                  }}
                />
              </div>
              <h1 className="text-primary-lightest font-extrabold text-4xl">WealthSmart</h1>
              {user && <p className="text-primary-lightest/80 text-sm mt-2">Welcome back, {user.first_name || user.username}!</p>}
            </div>
          </div>

          {/* Message Section */}
          <div className="px-6 py-1 text-center bg-background">
            <p className="text-text text-lg leading-relaxed mb-2">
              <span className="text-primary font-bold text-2xl">LIFE</span> isn't about{' '}
              <span className="text-secondary font-bold text-xl">STOPPING</span>
            </p>
            <p className="text-text-muted text-md mb-2">
              it's about <span className="text-primary font-semibold">CHOOSING WELL</span>
            </p>
            <p className="text-text-muted text-md mb-6">
              and what <span className="text-secondary font-semibold italic">MATTERS</span>
            </p>
            <p className="text-primary font-extrabold text-3xl tracking-wide mt-4">
              SPEND WISELY
            </p>
          </div>

          {/* Navigation Cards - Mobile with Flip Effect */}
          <div className="px-6 py-4 space-y-6">
            {navCards.map((card, index) => (
              <div
                key={index}
                className="card-container"
                style={{ height: '400px', width: '100%' }}
                onMouseEnter={() => setFlippedCard(index)}
                onMouseLeave={() => setFlippedCard(null)}
              >
                <div
                  className={`card-flipper ${flippedCard === index ? 'flipped' : ''}`}
                  style={{ height: '100%', width: '100%', cursor: 'pointer' }}
                  onClick={() => navigate(card.path)}
                >
                  {/* Front of card - Using theme colors */}
                  <div className="card-front bg-secondary-darkest/90 border border-border rounded-xl overflow-hidden shadow-lg backdrop-blur-sm">
                    <div className="flex flex-col items-center justify-center h-full p-6">
                      <div className="text-primary mb-4">
                        {card.icon}
                      </div>
                      <h3 className="text-text font-bold text-xl text-center">
                        {card.title}
                      </h3>
                      <p className="text-text-muted text-xs text-center mt-4">
                        Tap to flip →
                      </p>
                    </div>
                  </div>

                  {/* Back of card - Using theme colors */}
                  <div className="card-back bg-secondary-darkest/95 border border-border rounded-xl overflow-hidden shadow-lg backdrop-blur-sm">
                    <div className="flex flex-col items-center justify-center h-full p-6">
                      <p className="text-text text-sm leading-relaxed text-center">
                        {card.description}
                      </p>
                      <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-darkest transition-colors">
                        Get Started →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Desktop Layout
        <div className="relative min-h-screen">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${HomePageBG})` }}
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-background-hero/65 backdrop-blur-[5px]" />
          
          {/* Secondary Mask Overlay */}
          <div
            className="absolute inset-0 bg-secondary-darkest/30"
            style={{
              maskImage: `url(${WealthSmartBG})`,
              maskSize: 'cover',
              maskPosition: 'center',
              maskRepeat: 'no-repeat',
            }}
          />

          {/* Content */}
          <div className="relative z-10 min-h-screen flex flex-col">
            {/* Hero Section */}
            <div className="flex-1 flex items-center justify-center px-12 pt-16">
              <div className="grid grid-cols-12 w-full items-center">
                {/* Left Spacer */}
                <div className="col-span-1" />
                
                {/* Main Message */}
                <div className="col-span-6 space-y-6 w-full p-8">
                  <div className="space-y-2">
                    <p className="text-hero-lightest text-2xl">
                      <span 
                        className="text-6xl font-black text-hero-darkest"
                        style={{textShadow:'2px 2px var(--hero)'}}
                      >LIFE is not</span>{' '}
                      <span className="text-hero-lightest text-shadow-sm">about</span>
                    </p>
                    <p className="text-hero-lightest text-2xl">
                      <span className="text-5xl font-black text-hero-darkest" style={{textShadow:'2px 2px var(--hero)'}} >STOPPING</span>
                    </p>
                    <p className="text-hero-lightest text-2xl">
                      it's about <span className="text-hero-darkest text-3xl font-black" style={{textShadow:'2px 2px var(--hero)'}}>CHOOSING WELL</span>
                    </p>
                    <p className="text-hero-lightest text-2xl">
                      and what <span className="font-black text-3xl text-hero-darkest" style={{textShadow:'2px 2px var(--hero)'}}>MATTERS</span>
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <p className="text-hero text-6xl font-black tracking-wide" style={{textShadow:'4px 1px var(--hero-darkest)'}}>
                      SPEND WISELY
                    </p>
                  </div>

                  {/* Conditional Buttons */}
                  {!user && (
                    <div className="flex gap-4 pt-6">
                      <button 
                        onClick={() => navigate("/register")}
                        className="bg-primary cursor-pointer text-white px-8 py-3 rounded-lg font-bold text-lg shadow-xl hover:bg-primary-darkest transition transform hover:scale-105"
                      >
                        Register
                      </button>
                      <button 
                        onClick={() => navigate("/login")}
                        className="border-2 cursor-pointer bg-secondary-darkest/40 border-primary text-primary px-8 py-3 rounded-lg font-semibold text-lg hover:bg-primary-lightest/10 transition backdrop-blur-sm backdrop-brightness-75"
                      >
                        Login
                      </button>
                    </div>
                  )}

                  {/* Welcome message for logged in users */}
                  {user && (
                    <div className="pt-6">
                      <p className="text-hero-lightest text-xl">
                        Welcome back, <span className="font-bold text-primary">{user.first_name || user.username}</span>!
                      </p>
                    </div>
                  )}
                </div>

                {/* Icon Card */}
                <div className="col-span-4 h-[30em] w-full flex justify-center">
                  <div className="bg-background/30 backdrop-blur-sm w-full rounded-tr-2xl rounded-br-2xl p-8 shadow-2xl">
                    <div className="w-80 h-80 mx-auto">
                      <div
                        className="bg-secondary"
                        style={{
                          maskImage: `url(${WealthSmartIcon})`,
                          maskSize: 'contain',
                          maskPosition: 'center',
                          maskRepeat: 'no-repeat',
                          width: '100%',
                          height: '100%',
                        }}
                      />
                    </div>
                    <h2 className="text-secondary text-3xl font-bold text-center mt-4">
                      WealthSmart
                    </h2>
                    <p className="text-secondary/80 text-center mt-2 text-sm">
                      Smart spending, smarter living
                    </p>
                  </div>
                </div>
                
                {/* Right Spacer */}
                <div className="col-span-1" />
              </div>
            </div>

            {/* Navigation Cards Section - Desktop with Flip Effect */}
            <div className="pb-12 px-12 mt-8">
              <div className="grid grid-cols-4 gap-6 max-w-7xl mx-auto">
                {navCards.map((card, index) => (
                  <div
                    key={index}
                    className="card-container"
                    style={{ height: '500px', width: '100%' }}
                    onMouseEnter={() => setFlippedCard(index)}
                    onMouseLeave={() => setFlippedCard(null)}
                  >
                    <div
                      className={`card-flipper ${flippedCard === index ? 'flipped' : ''}`}
                      style={{ height: '100%', width: '100%', cursor: 'pointer' }}
                      onClick={() => navigate(card.path)}
                    >
                      {/* Front of card - Using theme colors */}
                      <div className="card-front bg-primary-darkest border border-border rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
                        <div className="flex flex-col items-center justify-center h-full p-6">
                          <div className="text-card-text mb-6">
                            {card.icon}
                          </div>
                          <h3 className="text-card-text font-bold text-2xl text-center">
                            {card.title}
                          </h3>
                        </div>
                      </div>

                      {/* Back of card - Using theme colors */}
                      <div className="card-back bg-primary-darkest border border-border rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
                        <div className="flex flex-col items-center justify-center h-full p-6">
                          <p className="text-card-text text-base leading-relaxed text-center">
                            {card.description}
                          </p>
                          <button className="mt-6 px-6 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-darkest transition-colors">
                            Get Started →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}