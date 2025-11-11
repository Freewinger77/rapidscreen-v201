export interface CandidateNote {
  id: string;
  text: string;
  timestamp: string;
  author: string;
  actionType?: string;
  actionDate?: string;
}

export interface Candidate {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status:
    | "not-contacted"
    | "interested"
    | "started-work"
    | "rejected"
    | "interview";
  notes?: CandidateNote[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  employmentType: string;
  salaryRange: string;
  openPositions: number;
  hired: number;
  target: number;
  description: string;
  tags: string[];
  candidates: Candidate[];
}

export const jobsData: Job[] = [
  {
    id: "1",
    title: "Site Engineer",
    company: "Barrows and Sons",
    location: "Birmingham, UK",
    employmentType: "Full Time",
    salaryRange: "$12.00 - $15.00",
    openPositions: 5,
    hired: 2,
    target: 4,
    description:
      "Lorem ipsum dolor sit amet consectetur. Ac integer et in felis metus sed a pretium. Feugiat sit vitae neque laoreet ultricies egestas. Sollicitudin viverra donec non aliquet venenatis. Purus nibh tincidunt urames ac ut diam platea congue.",
    tags: ["AutoCA", "Site Supervision", "CSCS card", "CSCS card"],
    candidates: [
      {
        id: "c1",
        name: "Natasha Pagac",
        phone: "+44 7700 900001",
        email: "natasha.pagac@example.com",
        status: "not-contacted",
        notes: [
          {
            id: "n1",
            text: "Called candidate, left voicemail. Candidate has 3 years of site engineering experience.",
            timestamp: "15/01/2024 14:30",
            author: "Sarah Johnson",
            actionType: "call",
            actionDate: "2024-01-20",
          },
          {
            id: "n2",
            text: "Candidate expressed interest in Birmingham location. Needs to check availability with current employer.",
            timestamp: "12/01/2024 10:15",
            author: "Mike Chen",
            actionType: "email",
          },
        ],
      },
      {
        id: "c2",
        name: "William Bartoletti",
        phone: "+44 7700 900002",
        email: "w.bartoletti@example.com",
        status: "not-contacted",
        notes: [],
      },
      {
        id: "c3",
        name: "Jeannette Quigley",
        phone: "+44 7700 900003",
        email: "j.quigley@example.com",
        status: "not-contacted",
        notes: [
          {
            id: "n3",
            text: "Strong candidate with AutoCAD certification. Available to start immediately.",
            timestamp: "14/01/2024 16:45",
            author: "Emma Williams",
            actionType: "meeting",
            actionDate: "2024-01-18",
          },
        ],
      },
      {
        id: "c4",
        name: "Dean Donnelly",
        phone: "+44 7700 900004",
        email: "dean.d@example.com",
        status: "not-contacted",
        notes: [],
      },
      {
        id: "c5",
        name: "Erika Parisian",
        phone: "+44 7700 900005",
        email: "erika.p@example.com",
        status: "interested",
        notes: [
          {
            id: "n4",
            text: "Candidate confirmed interest. Scheduling interview for next week. Has valid CSCS card.",
            timestamp: "13/01/2024 11:20",
            author: "Sarah Johnson",
            actionType: "call",
            actionDate: "2024-01-22",
          },
          {
            id: "n5",
            text: "Sent job description and company details via email. Awaiting response.",
            timestamp: "10/01/2024 09:30",
            author: "Mike Chen",
            actionType: "email",
          },
        ],
      },
      {
        id: "c6",
        name: "Ronnie Dickinson",
        phone: "+44 7700 900006",
        email: "r.dickinson@example.com",
        status: "interested",
        notes: [],
      },
      {
        id: "c7",
        name: "Sophie Considine",
        phone: "+44 7700 900007",
        email: "sophie.c@example.com",
        status: "interested",
        notes: [
          {
            id: "n6",
            text: "Excellent references from previous employer. Highly motivated candidate.",
            timestamp: "11/01/2024 15:00",
            author: "Emma Williams",
          },
        ],
      },
      {
        id: "c8",
        name: "Boyd Schumm",
        phone: "+44 7700 900008",
        email: "boyd.s@example.com",
        status: "interested",
        notes: [],
      },
      {
        id: "c9",
        name: "Robyn Satterfield",
        phone: "+44 7700 900009",
        email: "robyn.s@example.com",
        status: "started-work",
        notes: [
          {
            id: "n7",
            text: "Started work on 08/01/2024. First week going well. Manager reports positive feedback.",
            timestamp: "12/01/2024 17:30",
            author: "Sarah Johnson",
          },
          {
            id: "n8",
            text: "Completed onboarding and safety training. All documentation submitted.",
            timestamp: "08/01/2024 14:00",
            author: "Mike Chen",
          },
        ],
      },
      {
        id: "c10",
        name: "Tanya Vandervort",
        phone: "+44 7700 900010",
        email: "tanya.v@example.com",
        status: "started-work",
        notes: [
          {
            id: "n9",
            text: "Performing exceptionally well. Site supervisor very impressed with work quality.",
            timestamp: "14/01/2024 10:00",
            author: "Emma Williams",
          },
        ],
      },
    ],
  },
  {
    id: "2",
    title: "Project Manager",
    company: "Tech Solutions Ltd",
    location: "London, UK",
    employmentType: "Full Time",
    salaryRange: "$45.00 - $60.00",
    openPositions: 3,
    hired: 1,
    target: 3,
    description:
      "Seeking an experienced project manager to lead our development teams and deliver high-quality software solutions.",
    tags: ["Agile", "Scrum", "Leadership", "Communication"],
    candidates: [
      {
        id: "c11",
        name: "Sarah Johnson",
        phone: "+44 7700 900011",
        email: "sarah.j@example.com",
        status: "not-contacted",
        notes: [],
      },
      {
        id: "c12",
        name: "Michael Chen",
        phone: "+44 7700 900012",
        email: "michael.c@example.com",
        status: "interested",
        notes: [
          {
            id: "n10",
            text: "Strong project management background. Previously worked on similar scale projects.",
            timestamp: "13/01/2024 13:45",
            author: "John Smith",
            actionType: "whatsapp",
            actionDate: "2024-01-19",
          },
        ],
      },
      {
        id: "c13",
        name: "Emma Williams",
        phone: "+44 7700 900013",
        email: "emma.w@example.com",
        status: "interview",
        notes: [
          {
            id: "n11",
            text: "Interview scheduled for 18/01/2024 at 2 PM. Candidate very enthusiastic about the role.",
            timestamp: "15/01/2024 09:00",
            author: "John Smith",
            actionType: "meeting",
            actionDate: "2024-01-18",
          },
        ],
      },
    ],
  },
];

export const getJobById = (id: string): Job | undefined => {
  return jobsData.find((job) => job.id === id);
};

export const getCandidatesByStatus = (
  job: Job,
  status: Candidate["status"]
): Candidate[] => {
  return job.candidates.filter((candidate) => candidate.status === status);
};
