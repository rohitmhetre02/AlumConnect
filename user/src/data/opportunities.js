export const opportunities = [
  {
    id: 'frontend-engineer',
    title: 'Frontend Engineer',
    company: 'Google',
    type: 'job',
    location: 'Remote',
    tags: ['React', 'TypeScript'],
    description:
      'Build performant interfaces for internal tools and alumni experiences. Collaborate closely with product designers and backend teams.',
    email: 'careers@google.com',
  },
  {
    id: 'product-analyst',
    title: 'Product Analyst',
    company: 'Airbnb',
    type: 'job',
    location: 'San Francisco, CA',
    tags: ['SQL', 'A/B Testing'],
    description:
      'Support product squads with insights from experimentation and data modeling. Drive roadmap decisions with evidence-based recommendations.',
    email: 'talent@airbnb.com',
  },
  {
    id: 'cloud-intern',
    title: 'Cloud Engineering Intern',
    company: 'Amazon',
    type: 'internship',
    location: 'Seattle, WA',
    tags: ['AWS', 'DevOps'],
    description:
      'Join the cloud infrastructure team for a 12-week internship focused on scalable deployments and automation.',
    email: 'internships@amazon.com',
  },
  {
    id: 'ux-intern',
    title: 'UX Research Intern',
    company: 'Figma',
    type: 'internship',
    location: 'Remote',
    tags: ['Research', 'Prototyping'],
    description:
      'Assist the research team with user interviews, synthesis, and prototype testing for new collaboration features.',
    email: 'intern-program@figma.com',
  },
]

export const getOpportunityById = (id) => opportunities.find((item) => item.id === id)
