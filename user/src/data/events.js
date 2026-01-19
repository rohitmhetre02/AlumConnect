const events = [
  {
    id: 'annual-meetup',
    title: 'Annual Alumni Meetup 2024',
    summary: 'Reconnect with alumni, students, and faculty during an evening of celebration and networking.',
    coverImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
    date: 'March 12, 2024',
    time: '5:30 PM – 9:00 PM',
    location: 'Grand Hall, City Center',
    attendees: 230,
    description:
      'Our signature community gathering returns with curated mentorship lounges, innovation showcases, and fireside conversations hosted by distinguished alumni leaders.',
    highlights: [
      'Opening keynote by Dr. Priya Verma on collaborative innovation',
      'Mentorship matchmaking lounge for alumni and final-year students',
      'Startup alley featuring 12 student and alumni-led ventures',
    ],
    schedule: [
      { time: '5:30 PM', label: 'Community Mixer & Registration' },
      { time: '6:15 PM', label: 'Keynote & Awards' },
      { time: '7:30 PM', label: 'Innovation Showcase Walkthrough' },
      { time: '8:15 PM', label: 'Mentorship Roundtables' },
    ],
  },
  {
    id: 'innovation-summit',
    title: 'Innovation Summit 2024',
    summary: 'A full-day summit spotlighting breakthrough research, prototypes, and alumni ventures.',
    coverImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
    date: 'April 27, 2024',
    time: '9:00 AM – 5:00 PM',
    location: 'Innovation Pavilion, University Campus',
    attendees: 420,
    description:
      'Discover collaborative research sprints, interactive labs, and alumni venture showcases designed to accelerate impact across industries.',
    highlights: [
      'Panel on Responsible AI featuring faculty and industry leaders',
      'Prototype lab tours guided by student founders',
      'Networking reception curated by regional alumni chapters',
    ],
    schedule: [
      { time: '9:00 AM', label: 'Registration & Lab Tours' },
      { time: '10:30 AM', label: 'Keynote: Future of Responsible Tech' },
      { time: '1:00 PM', label: 'Venture Pitch Showcase' },
      { time: '3:30 PM', label: 'Chapter Networking Mixer' },
    ],
  },
  {
    id: 'career-fair',
    title: 'Career Fair 2024',
    summary: 'Global recruiters, alumni hiring managers, and mentorship clinics in one immersive experience.',
    coverImage: 'https://images.unsplash.com/photo-1475724017904-b712052c192a?auto=format&fit=crop&w=1600&q=80',
    date: 'May 18, 2024',
    time: '10:00 AM – 6:00 PM',
    location: 'Leadership Center, Main Campus',
    attendees: 680,
    description:
      'Engage with 45+ hiring partners, join industry roundtables, and receive real-time feedback on portfolios and interviews.',
    highlights: [
      'Industry roundtables led by alumni from Fortune 500 companies',
      'On-site resume reviews and mock interviews',
      'Closing fireside chat with recent alumni founders',
    ],
    schedule: [
      { time: '10:00 AM', label: 'Employer Booths Open' },
      { time: '11:30 AM', label: 'Mentorship Clinics Begin' },
      { time: '2:00 PM', label: 'Industry Roundtables' },
      { time: '5:00 PM', label: 'Alumni Founders Fireside' },
    ],
  },
  {
    id: 'tech-talk-series',
    title: 'Tech Talk Series: Human-Centered AI',
    summary: 'Monthly live session unpacking practical ways to build ethical, inclusive AI products.',
    coverImage: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80',
    date: 'June 06, 2024',
    time: '7:00 PM – 8:30 PM',
    location: 'Global Webinar (Online)',
    attendees: 320,
    description:
      'Learn proven frameworks for cross-functional AI teams and explore real-world case studies from alumni product leaders.',
    highlights: [
      'Live Q&A with product and research leaders',
      'Breakout rooms for domain-specific discussions',
      'Resource kit with templates and toolkits',
    ],
    schedule: [
      { time: '7:00 PM', label: 'Welcome & Alumni Spotlight' },
      { time: '7:10 PM', label: 'Keynote: Designing Ethical AI Journeys' },
      { time: '7:45 PM', label: 'Interactive Case Walkthrough' },
      { time: '8:15 PM', label: 'Live Q&A + Closing' },
    ],
  },
]

export default events
