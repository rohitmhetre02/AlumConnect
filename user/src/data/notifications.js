export const notifications = [
  { id: '1', title: 'New mentee request from Michael Brown', time: '2m ago', type: 'request' },
  { id: '2', title: 'Session reminder: Career Guidance with Alice in 30 mins', time: '30m ago', type: 'reminder' },
  { id: '3', title: 'Your mentorship session was accepted', time: '2h ago', type: 'success' },
  { id: '4', title: 'New platform announcement: Q4 Goals', time: '1d ago', type: 'info' },
]

export const messages = [
  {
    id: 'm1',
    sender: 'David Chen',
    preview: 'Hey, thanks for the mentorship session! It was inspiring.',
    time: '10m',
    avatar: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=200&q=80',
    conversation: [
      {
        id: 'm1-1',
        direction: 'incoming',
        text: 'Hey! Thanks again for the mentorship session yesterday. It was inspiring.',
        timestamp: 'Nov 24, 2025 · 9:10 AM',
      },
      {
        id: 'm1-2',
        direction: 'outgoing',
        text: "Glad it was helpful, David. Feel free to send your notes if you'd like feedback.",
        timestamp: 'Nov 24, 2025 · 9:18 AM',
      },
      {
        id: 'm1-3',
        direction: 'incoming',
        text: "Absolutely! I'll share them later today. Have a great morning!",
        timestamp: 'Nov 24, 2025 · 9:20 AM',
      },
      {
        id: 'm1-4',
        direction: 'outgoing',
        text: 'Looking forward to it. Talk soon!',
        timestamp: 'Nov 24, 2025 · 9:21 AM',
      },
    ],
  },
  {
    id: 'm2',
    sender: 'Emily Davis',
    preview: 'Are you going to the alumni meet this weekend?',
    time: '2h',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    conversation: [
      {
        id: 'm2-1',
        direction: 'incoming',
        text: 'Hi! Are you going to the alumni meet this weekend?',
        timestamp: 'Nov 23, 2025 · 4:05 PM',
      },
      {
        id: 'm2-2',
        direction: 'outgoing',
        text: "Thinking about it! Are you attending?",
        timestamp: 'Nov 23, 2025 · 4:08 PM',
      },
      {
        id: 'm2-3',
        direction: 'incoming',
        text: "Yes! There's a panel on product design that looks great.",
        timestamp: 'Nov 23, 2025 · 4:15 PM',
      },
      {
        id: 'm2-4',
        direction: 'outgoing',
        text: 'Awesome, count me in. Let’s meet 15 minutes before the session?',
        timestamp: 'Nov 23, 2025 · 4:19 PM',
      },
    ],
  },
  {
    id: 'm3',
    sender: 'Prof. Wilson',
    preview: 'Please review the attached research document when you can.',
    time: '1d',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    conversation: [
      {
        id: 'm3-1',
        direction: 'incoming',
        text: 'Sharing the research document we discussed—could you review it by Friday?',
        timestamp: 'Nov 22, 2025 · 1:12 PM',
      },
      {
        id: 'm3-2',
        direction: 'outgoing',
        text: 'Thank you. I’ll go through it and leave comments by Thursday evening.',
        timestamp: 'Nov 22, 2025 · 1:20 PM',
      },
      {
        id: 'm3-3',
        direction: 'incoming',
        text: 'Perfect. Let me know if any section needs clarification.',
        timestamp: 'Nov 22, 2025 · 1:24 PM',
      },
      {
        id: 'm3-4',
        direction: 'outgoing',
        text: 'Will do. Thanks for sending this over.',
        timestamp: 'Nov 22, 2025 · 1:27 PM',
      },
    ],
  },
  {
    id: 'm4',
    sender: 'Sarah Smith',
    preview: "I've sent the project details.",
    time: '2d',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
    conversation: [
      {
        id: 'm4-1',
        direction: 'incoming',
        text: "I've sent the project details through email.",
        timestamp: 'Nov 21, 2025 · 5:48 PM',
      },
      {
        id: 'm4-2',
        direction: 'outgoing',
        text: "Thanks Sarah! I'll review them tonight and share feedback tomorrow.",
        timestamp: 'Nov 21, 2025 · 5:55 PM',
      },
      {
        id: 'm4-3',
        direction: 'incoming',
        text: 'Great. The timeline milestones are on the second page.',
        timestamp: 'Nov 21, 2025 · 6:02 PM',
      },
      {
        id: 'm4-4',
        direction: 'outgoing',
        text: 'Got it. I’ll confirm once I’m done reading.',
        timestamp: 'Nov 21, 2025 · 6:05 PM',
      },
    ],
  },
]
