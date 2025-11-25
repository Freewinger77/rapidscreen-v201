export interface CampaignTarget {
  id: string;
  name: string;
  type: "column" | "custom";
  description?: string;
  goalType?: "text" | "number" | "boolean";
}

export interface CampaignMatrix {
  id: string;
  name: string;
  description?: string;
  whatsappMessage?: string;
  callScript?: string;
}

export interface CallTranscriptMessage {
  id: string;
  speaker: "user" | "agent";
  message: string;
  timestamp?: string;
}

export interface WhatsAppMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
}

export interface CandidateNote {
  id: string;
  text: string;
  timestamp: string;
  author: string;
  actionType?: string;
  actionDate?: string;
}

export interface TimelineEvent {
  id: string;
  type: "whatsapp" | "call" | "note" | "system";
  timestamp: string;
  description: string;
  details?: any;
}

export interface CallRecord {
  id: string;
  callId: string;
  phoneFrom: string;
  phoneTo: string;
  duration: string;
  timestamp: string;
  transcript: CallTranscriptMessage[];
  availableToWork: boolean | null;
  interested: boolean | null;
  knowReferee: boolean | null;
}

export interface CampaignCandidate {
  id: string;
  forename: string;
  surname: string;
  telMobile: string;
  email?: string;
  callStatus:
    | "not_called"
    | "agent_hangup"
    | "user_declined"
    | "user_hangup"
    | "no_answer"
    | "voicemail"
    | "invalid_destination";
  availableToWork: boolean | null;
  interested: boolean | null;
  knowReferee: boolean | null;
  calls: CallRecord[];
  whatsappMessages?: WhatsAppMessage[];
  notes?: CandidateNote[];
  lastContact?: string;
  experience?: string;
}

export interface Campaign {
  id: string;
  name: string;
  jobId: string;
  jobTitle: string;
  linkJob?: string;
  startDate: string;
  endDate: string;
  channels: ("WhatsApp" | "Call" | "Email")[];
  targets: CampaignTarget[];
  matrices: CampaignMatrix[];
  totalCandidates: number;
  hired: number;
  responseRate: number;
  status: "active" | "draft" | "completed" | "stopped";
  createdAt: string;
  candidates?: CampaignCandidate[];
}

// Helper function to generate realistic candidate data
function generateCandidates(
  startId: number,
  count: number
): CampaignCandidate[] {
  const firstNames = [
    "William",
    "Sarah",
    "Michael",
    "Emma",
    "James",
    "Olivia",
    "Daniel",
    "Sophia",
    "Benjamin",
    "Isabella",
    "Lucas",
    "Mia",
    "Alexander",
    "Charlotte",
    "Ethan",
    "Amelia",
    "Henry",
    "Ava",
    "Jack",
    "Ella",
    "Sebastian",
    "Lily",
    "Matthew",
    "Grace",
    "Noah",
    "Chloe",
    "Liam",
    "Zoe",
    "Mason",
    "Aria",
  ];

  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Anderson",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin",
    "Lee",
    "Thompson",
    "White",
    "Harris",
    "Clark",
    "Lewis",
    "Robinson",
    "Walker",
    "Hall",
    "Allen",
  ];

  const callStatuses: CampaignCandidate["callStatus"][] = [
    "no_answer",
    "voicemail",
    "user_hangup",
    "agent_hangup",
    "user_declined",
    "invalid_destination",
  ];

  const candidates: CampaignCandidate[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const callStatus = callStatuses[i % callStatuses.length];
    const id = `c${startId + i}`;

    candidates.push({
      id,
      forename: firstName,
      surname: lastName,
      telMobile: `+4477${String(Math.floor(Math.random() * 100000000)).padStart(8, "0")}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      callStatus,
      availableToWork:
        callStatus === "voicemail" || callStatus === "agent_hangup"
          ? true
          : callStatus === "user_declined" || callStatus === "user_hangup"
            ? false
            : null,
      interested:
        callStatus === "voicemail"
          ? true
          : callStatus === "user_declined"
            ? false
            : null,
      knowReferee:
        callStatus === "voicemail" && i % 3 === 0
          ? true
          : callStatus === "agent_hangup"
            ? false
            : null,
      lastContact: `${Math.floor(Math.random() * 10) + 1} ${i % 2 === 0 ? "hours" : "days"} ago`,
      experience: `${Math.floor(Math.random() * 12) + 1} Years`,
      calls: [],
    });
  }

  return candidates;
}

export const campaignsData: Campaign[] = [
  {
    id: "1",
    name: "Plumber - London",
    jobId: "1",
    jobTitle: "Site Engineer",
    linkJob: "Software Engineer",
    startDate: "2025-08-25",
    endDate: "2025-08-25",
    channels: ["WhatsApp", "Call"],
    targets: [
      { id: "t1", name: "Available to Work (Rostrum)", type: "column" },
      { id: "t2", name: "Interested (Rostrum)", type: "column" },
    ],

    matrices: [
      { id: "m1", name: "Initial Outreach" },
      { id: "m2", name: "Collect Email" },
      { id: "m3", name: "Experience" },
      { id: "m4", name: "Location" },
      { id: "m5", name: "Notice Period" },
      { id: "m6", name: "Expected Salary" },
    ],

    totalCandidates: 30,
    hired: 9,
    responseRate: 78,
    status: "active",
    createdAt: "2025-08-25",
    candidates: [
      {
        id: "c1",
        forename: "William",
        surname: "Chukwu Akam",
        telMobile: "+447853723604",
        email: "william.akam@example.com",
        callStatus: "agent_hangup",
        availableToWork: false,
        interested: null,
        knowReferee: false,
        lastContact: "2 days ago (Failed)",
        experience: "5 Years",
        whatsappMessages: [
          {
            id: "wa1",
            sender: "agent",
            text: "Hi! We have an exciting opportunity for a Steel Fixer position at Hinkley Point C. Are you interested?",
            timestamp: "04/09/2025 19:45",
            status: "read",
          },
          {
            id: "wa2",
            sender: "user",
            text: "Yes, I'm interested. Can you tell me more?",
            timestamp: "04/09/2025 19:47",
          },
          {
            id: "wa3",
            sender: "agent",
            text: "Great! Do you have prior formwork experience or a Blue card?",
            timestamp: "04/09/2025 19:48",
            status: "read",
          },
        ],

        notes: [
          {
            id: "n1",
            text: "Candidate showed initial interest but didn't respond to follow-up questions about experience.",
            timestamp: "04/09/2025 20:00",
            author: "Agent",
          },
          {
            id: "n2",
            text: "Schedule follow-up call for tomorrow.",
            timestamp: "04/09/2025 20:05",
            author: "Recruiter",
            actionType: "Call",
            actionDate: "05/09/2025",
          },
        ],

        calls: [
          {
            id: "call1",
            callId: "call_2a9361a6a309e35be26654b2d25",
            phoneFrom: "+447874497138",
            phoneTo: "+447853723604",
            duration: "07:19",
            timestamp: "04/09/2025 19:51",
            availableToWork: false,
            interested: null,
            knowReferee: false,
            transcript: [
              {
                id: "t1",
                speaker: "user",
                message:
                  "This is the Vodafone voice mail service for seven eight five three seven two three six zero four. Please leave a message after the tone.",
              },
              {
                id: "t2",
                speaker: "user",
                message:
                  "you've finished recording, please hang up or press the hash key for more options.",
              },
              {
                id: "t3",
                speaker: "agent",
                message:
                  "Hi, this is James from Nucleo Talent. We're hiring steel fixers for Hinkley Point C. Interested?",
              },
              {
                id: "t4",
                speaker: "agent",
                message:
                  "Just checking in—are you interested in steel fixer roles at Hinkley Point C?",
              },
              {
                id: "t5",
                speaker: "user",
                message: "You have fifteen seconds recording remaining.",
              },
              {
                id: "t6",
                speaker: "agent",
                message:
                  "No worries. If you're busy, I can text you a link with job and pay details. Sound good?",
              },
              {
                id: "t7",
                speaker: "agent",
                message: "I'm here to help if you want",
              },
            ],
          },
        ],
      },
      {
        id: "c2",
        forename: "William",
        surname: "Antonio Silva Andrelino",
        telMobile: "+447949776830",
        callStatus: "user_declined",
        availableToWork: null,
        interested: null,
        knowReferee: null,
        calls: [],
      },
      {
        id: "c3",
        forename: "William",
        surname: "Akam",
        telMobile: "+447563301932",
        callStatus: "agent_hangup",
        availableToWork: true,
        interested: null,
        knowReferee: false,
        calls: [],
      },
      {
        id: "c4",
        forename: "Vincent",
        surname: "Azi Ebube",
        telMobile: "+447760807624",
        callStatus: "user_hangup",
        availableToWork: false,
        interested: null,
        knowReferee: false,
        calls: [],
      },
      {
        id: "c5",
        forename: "Vilson",
        surname: "Ndreu",
        telMobile: "+447735720999",
        callStatus: "agent_hangup",
        availableToWork: false,
        interested: null,
        knowReferee: false,
        calls: [],
      },
      {
        id: "c6",
        forename: "Victor",
        surname: "Mendes Pereira",
        telMobile: "+447738477155",
        callStatus: "invalid_destination",
        availableToWork: null,
        interested: null,
        knowReferee: null,
        calls: [],
      },
      {
        id: "c7",
        forename: "Sarah",
        surname: "Johnson",
        telMobile: "+447856234567",
        email: "sarah.johnson@example.com",
        callStatus: "no_answer",
        availableToWork: null,
        interested: null,
        knowReferee: null,
        lastContact: "1 day ago (No Answer)",
        experience: "3 Years",
        calls: [],
      },
      {
        id: "c8",
        forename: "Michael",
        surname: "Thompson",
        telMobile: "+447923456789",
        email: "m.thompson@example.com",
        callStatus: "voicemail",
        availableToWork: true,
        interested: true,
        knowReferee: false,
        lastContact: "3 hours ago (Voicemail)",
        experience: "7 Years",
        calls: [],
      },
      {
        id: "c9",
        forename: "Emma",
        surname: "Davis",
        telMobile: "+447834567890",
        email: "emma.davis@example.com",
        callStatus: "user_hangup",
        availableToWork: false,
        interested: false,
        knowReferee: null,
        lastContact: "5 days ago (Hung Up)",
        experience: "2 Years",
        calls: [],
      },
      {
        id: "c10",
        forename: "James",
        surname: "Wilson",
        telMobile: "+447745678901",
        email: "james.wilson@example.com",
        callStatus: "agent_hangup",
        availableToWork: true,
        interested: null,
        knowReferee: true,
        lastContact: "2 days ago (Failed)",
        experience: "10 Years",
        calls: [],
      },
      {
        id: "c11",
        forename: "Olivia",
        surname: "Martinez",
        telMobile: "+447656789012",
        email: "olivia.martinez@example.com",
        callStatus: "no_answer",
        availableToWork: null,
        interested: null,
        knowReferee: null,
        lastContact: "4 hours ago (No Answer)",
        experience: "4 Years",
        calls: [],
      },
      {
        id: "c12",
        forename: "Daniel",
        surname: "Anderson",
        telMobile: "+447567890123",
        email: "daniel.anderson@example.com",
        callStatus: "voicemail",
        availableToWork: true,
        interested: true,
        knowReferee: false,
        lastContact: "1 day ago (Voicemail)",
        experience: "6 Years",
        calls: [],
      },
      {
        id: "c13",
        forename: "Sophia",
        surname: "Taylor",
        telMobile: "+447478901234",
        email: "sophia.taylor@example.com",
        callStatus: "user_declined",
        availableToWork: false,
        interested: false,
        knowReferee: null,
        lastContact: "6 days ago (Declined)",
        experience: "1 Year",
        calls: [],
      },
      {
        id: "c14",
        forename: "Benjamin",
        surname: "Thomas",
        telMobile: "+447389012345",
        email: "ben.thomas@example.com",
        callStatus: "agent_hangup",
        availableToWork: true,
        interested: null,
        knowReferee: false,
        lastContact: "3 days ago (Failed)",
        experience: "8 Years",
        calls: [],
      },
      {
        id: "c15",
        forename: "Isabella",
        surname: "Jackson",
        telMobile: "+447290123456",
        email: "isabella.jackson@example.com",
        callStatus: "no_answer",
        availableToWork: null,
        interested: null,
        knowReferee: null,
        lastContact: "2 hours ago (No Answer)",
        experience: "5 Years",
        calls: [],
      },
      {
        id: "c16",
        forename: "Lucas",
        surname: "White",
        telMobile: "+447101234567",
        email: "lucas.white@example.com",
        callStatus: "voicemail",
        availableToWork: true,
        interested: true,
        knowReferee: true,
        lastContact: "5 hours ago (Voicemail)",
        experience: "9 Years",
        calls: [],
      },
      {
        id: "c17",
        forename: "Mia",
        surname: "Harris",
        telMobile: "+447812345678",
        email: "mia.harris@example.com",
        callStatus: "user_hangup",
        availableToWork: false,
        interested: false,
        knowReferee: null,
        lastContact: "7 days ago (Hung Up)",
        experience: "3 Years",
        calls: [],
      },
      {
        id: "c18",
        forename: "Alexander",
        surname: "Clark",
        telMobile: "+447723456789",
        email: "alex.clark@example.com",
        callStatus: "agent_hangup",
        availableToWork: true,
        interested: null,
        knowReferee: false,
        lastContact: "1 day ago (Failed)",
        experience: "11 Years",
        calls: [],
      },
      {
        id: "c19",
        forename: "Charlotte",
        surname: "Lewis",
        telMobile: "+447634567890",
        email: "charlotte.lewis@example.com",
        callStatus: "no_answer",
        availableToWork: null,
        interested: null,
        knowReferee: null,
        lastContact: "6 hours ago (No Answer)",
        experience: "4 Years",
        calls: [],
      },
      {
        id: "c20",
        forename: "Ethan",
        surname: "Robinson",
        telMobile: "+447545678901",
        email: "ethan.robinson@example.com",
        callStatus: "voicemail",
        availableToWork: true,
        interested: true,
        knowReferee: false,
        lastContact: "3 hours ago (Voicemail)",
        experience: "6 Years",
        calls: [],
      },
      {
        id: "c21",
        forename: "Amelia",
        surname: "Walker",
        telMobile: "+447456789012",
        email: "amelia.walker@example.com",
        callStatus: "user_declined",
        availableToWork: false,
        interested: false,
        knowReferee: null,
        lastContact: "8 days ago (Declined)",
        experience: "2 Years",
        calls: [],
      },
      {
        id: "c22",
        forename: "Henry",
        surname: "Hall",
        telMobile: "+447367890123",
        email: "henry.hall@example.com",
        callStatus: "agent_hangup",
        availableToWork: true,
        interested: null,
        knowReferee: true,
        lastContact: "4 days ago (Failed)",
        experience: "12 Years",
        calls: [],
      },
      {
        id: "c23",
        forename: "Ava",
        surname: "Allen",
        telMobile: "+447278901234",
        email: "ava.allen@example.com",
        callStatus: "no_answer",
        availableToWork: null,
        interested: null,
        knowReferee: null,
        lastContact: "1 hour ago (No Answer)",
        experience: "5 Years",
        calls: [],
      },
      {
        id: "c24",
        forename: "William",
        surname: "Young",
        telMobile: "+447189012345",
        email: "william.young@example.com",
        callStatus: "voicemail",
        availableToWork: true,
        interested: true,
        knowReferee: false,
        lastContact: "7 hours ago (Voicemail)",
        experience: "8 Years",
        calls: [],
      },
      {
        id: "c25",
        forename: "Harper",
        surname: "King",
        telMobile: "+447890123456",
        email: "harper.king@example.com",
        callStatus: "user_hangup",
        availableToWork: false,
        interested: false,
        knowReferee: null,
        lastContact: "9 days ago (Hung Up)",
        experience: "3 Years",
        calls: [],
      },
      {
        id: "c26",
        forename: "Jack",
        surname: "Wright",
        telMobile: "+447701234567",
        email: "jack.wright@example.com",
        callStatus: "invalid_destination",
        availableToWork: null,
        interested: null,
        knowReferee: null,
        lastContact: "N/A (Invalid Number)",
        experience: "4 Years",
        calls: [],
      },
      {
        id: "c27",
        forename: "Ella",
        surname: "Lopez",
        telMobile: "+447612345678",
        email: "ella.lopez@example.com",
        callStatus: "agent_hangup",
        availableToWork: true,
        interested: null,
        knowReferee: false,
        lastContact: "2 days ago (Failed)",
        experience: "7 Years",
        calls: [],
      },
      {
        id: "c28",
        forename: "Sebastian",
        surname: "Hill",
        telMobile: "+447523456789",
        email: "sebastian.hill@example.com",
        callStatus: "no_answer",
        availableToWork: null,
        interested: null,
        knowReferee: null,
        lastContact: "8 hours ago (No Answer)",
        experience: "6 Years",
        calls: [],
      },
      {
        id: "c29",
        forename: "Lily",
        surname: "Scott",
        telMobile: "+447434567890",
        email: "lily.scott@example.com",
        callStatus: "voicemail",
        availableToWork: true,
        interested: true,
        knowReferee: true,
        lastContact: "4 hours ago (Voicemail)",
        experience: "10 Years",
        calls: [],
      },
      {
        id: "c30",
        forename: "Matthew",
        surname: "Green",
        telMobile: "+447345678901",
        email: "matthew.green@example.com",
        callStatus: "user_declined",
        availableToWork: false,
        interested: false,
        knowReferee: null,
        lastContact: "10 days ago (Declined)",
        experience: "5 Years",
        calls: [],
      },
    ],
  },
  {
    id: "2",
    name: "Plumber - London",
    jobId: "2",
    jobTitle: "Project Manager",
    startDate: "2025-08-25",
    endDate: "2025-08-25",
    channels: ["WhatsApp", "Call"],
    targets: [
      { id: "t3", name: "Available to Work (Rostrum)", type: "column" },
    ],

    matrices: [
      { id: "m7", name: "Initial Outreach" },
      { id: "m8", name: "Collect Email" },
    ],

    totalCandidates: 30,
    hired: 9,
    responseRate: 20,
    status: "active",
    createdAt: "2025-08-25",
    candidates: [
      {
        id: "c31",
        forename: "Grace",
        surname: "Adams",
        telMobile: "+447256789012",
        email: "grace.adams@example.com",
        callStatus: "no_answer",
        availableToWork: null,
        interested: null,
        knowReferee: null,
        lastContact: "2 hours ago (No Answer)",
        experience: "4 Years",
        calls: [],
      },
      {
        id: "c32",
        forename: "Noah",
        surname: "Baker",
        telMobile: "+447167890123",
        email: "noah.baker@example.com",
        callStatus: "voicemail",
        availableToWork: true,
        interested: true,
        knowReferee: false,
        lastContact: "5 hours ago (Voicemail)",
        experience: "8 Years",
        calls: [],
      },
      {
        id: "c33",
        forename: "Chloe",
        surname: "Nelson",
        telMobile: "+447878901234",
        email: "chloe.nelson@example.com",
        callStatus: "user_hangup",
        availableToWork: false,
        interested: false,
        knowReferee: null,
        lastContact: "6 days ago (Hung Up)",
        experience: "3 Years",
        calls: [],
      },
      {
        id: "c34",
        forename: "Liam",
        surname: "Carter",
        telMobile: "+447789012345",
        email: "liam.carter@example.com",
        callStatus: "agent_hangup",
        availableToWork: true,
        interested: null,
        knowReferee: true,
        lastContact: "3 days ago (Failed)",
        experience: "9 Years",
        calls: [],
      },
      {
        id: "c35",
        forename: "Zoe",
        surname: "Mitchell",
        telMobile: "+447690123456",
        email: "zoe.mitchell@example.com",
        callStatus: "no_answer",
        availableToWork: null,
        interested: null,
        knowReferee: null,
        lastContact: "1 hour ago (No Answer)",
        experience: "5 Years",
        calls: [],
      },
      {
        id: "c36",
        forename: "Mason",
        surname: "Perez",
        telMobile: "+447501234567",
        email: "mason.perez@example.com",
        callStatus: "voicemail",
        availableToWork: true,
        interested: true,
        knowReferee: false,
        lastContact: "6 hours ago (Voicemail)",
        experience: "7 Years",
        calls: [],
      },
      {
        id: "c37",
        forename: "Aria",
        surname: "Roberts",
        telMobile: "+447412345678",
        email: "aria.roberts@example.com",
        callStatus: "user_declined",
        availableToWork: false,
        interested: false,
        knowReferee: null,
        lastContact: "7 days ago (Declined)",
        experience: "2 Years",
        calls: [],
      },
      {
        id: "c38",
        forename: "Logan",
        surname: "Turner",
        telMobile: "+447323456789",
        email: "logan.turner@example.com",
        callStatus: "agent_hangup",
        availableToWork: true,
        interested: null,
        knowReferee: false,
        lastContact: "1 day ago (Failed)",
        experience: "11 Years",
        calls: [],
      },
      {
        id: "c39",
        forename: "Scarlett",
        surname: "Phillips",
        telMobile: "+447234567890",
        email: "scarlett.phillips@example.com",
        callStatus: "no_answer",
        availableToWork: null,
        interested: null,
        knowReferee: null,
        lastContact: "3 hours ago (No Answer)",
        experience: "4 Years",
        calls: [],
      },
      {
        id: "c40",
        forename: "Jackson",
        surname: "Campbell",
        telMobile: "+447145678901",
        email: "jackson.campbell@example.com",
        callStatus: "voicemail",
        availableToWork: true,
        interested: true,
        knowReferee: true,
        lastContact: "4 hours ago (Voicemail)",
        experience: "10 Years",
        calls: [],
      },
      {
        id: "c41",
        forename: "Victoria",
        surname: "Parker",
        telMobile: "+447856789012",
        email: "victoria.parker@example.com",
        callStatus: "user_hangup",
        availableToWork: false,
        interested: false,
        knowReferee: null,
        lastContact: "8 days ago (Hung Up)",
        experience: "3 Years",
        calls: [],
      },
      {
        id: "c42",
        forename: "Aiden",
        surname: "Evans",
        telMobile: "+447767890123",
        email: "aiden.evans@example.com",
        callStatus: "agent_hangup",
        availableToWork: true,
        interested: null,
        knowReferee: false,
        lastContact: "2 days ago (Failed)",
        experience: "6 Years",
        calls: [],
      },
      {
        id: "c43",
        forename: "Penelope",
        surname: "Edwards",
        telMobile: "+447678901234",
        email: "penelope.edwards@example.com",
        callStatus: "no_answer",
        availableToWork: null,
        interested: null,
        knowReferee: null,
        lastContact: "7 hours ago (No Answer)",
        experience: "5 Years",
        calls: [],
      },
      {
        id: "c44",
        forename: "Carter",
        surname: "Collins",
        telMobile: "+447589012345",
        email: "carter.collins@example.com",
        callStatus: "voicemail",
        availableToWork: true,
        interested: true,
        knowReferee: false,
        lastContact: "2 hours ago (Voicemail)",
        experience: "8 Years",
        calls: [],
      },
      {
        id: "c45",
        forename: "Layla",
        surname: "Stewart",
        telMobile: "+447490123456",
        email: "layla.stewart@example.com",
        callStatus: "user_declined",
        availableToWork: false,
        interested: false,
        knowReferee: null,
        lastContact: "9 days ago (Declined)",
        experience: "2 Years",
        calls: [],
      },
      {
        id: "c46",
        forename: "Wyatt",
        surname: "Sanchez",
        telMobile: "+447301234567",
        email: "wyatt.sanchez@example.com",
        callStatus: "invalid_destination",
        availableToWork: null,
        interested: null,
        knowReferee: null,
        lastContact: "N/A (Invalid Number)",
        experience: "4 Years",
        calls: [],
      },
      {
        id: "c47",
        forename: "Riley",
        surname: "Morris",
        telMobile: "+447212345678",
        email: "riley.morris@example.com",
        callStatus: "agent_hangup",
        availableToWork: true,
        interested: null,
        knowReferee: true,
        lastContact: "4 days ago (Failed)",
        experience: "12 Years",
        calls: [],
      },
      {
        id: "c48",
        forename: "Evelyn",
        surname: "Rogers",
        telMobile: "+447123456789",
        email: "evelyn.rogers@example.com",
        callStatus: "no_answer",
        availableToWork: null,
        interested: null,
        knowReferee: null,
        lastContact: "9 hours ago (No Answer)",
        experience: "6 Years",
        calls: [],
      },
      {
        id: "c49",
        forename: "Grayson",
        surname: "Reed",
        telMobile: "+447834567891",
        email: "grayson.reed@example.com",
        callStatus: "voicemail",
        availableToWork: true,
        interested: true,
        knowReferee: false,
        lastContact: "1 hour ago (Voicemail)",
        experience: "7 Years",
        calls: [],
      },
      {
        id: "c50",
        forename: "Hannah",
        surname: "Cook",
        telMobile: "+447745678902",
        email: "hannah.cook@example.com",
        callStatus: "user_hangup",
        availableToWork: false,
        interested: false,
        knowReferee: null,
        lastContact: "5 days ago (Hung Up)",
        experience: "3 Years",
        calls: [],
      },
      {
        id: "c51",
        forename: "Luke",
        surname: "Morgan",
        telMobile: "+447656789013",
        email: "luke.morgan@example.com",
        callStatus: "agent_hangup",
        availableToWork: true,
        interested: null,
        knowReferee: false,
        lastContact: "3 days ago (Failed)",
        experience: "9 Years",
        calls: [],
      },
      {
        id: "c52",
        forename: "Nora",
        surname: "Bell",
        telMobile: "+447567890124",
        email: "nora.bell@example.com",
        callStatus: "no_answer",
        availableToWork: null,
        interested: null,
        knowReferee: null,
        lastContact: "5 hours ago (No Answer)",
        experience: "5 Years",
        calls: [],
      },
      {
        id: "c53",
        forename: "Julian",
        surname: "Murphy",
        telMobile: "+447478901235",
        email: "julian.murphy@example.com",
        callStatus: "voicemail",
        availableToWork: true,
        interested: true,
        knowReferee: true,
        lastContact: "8 hours ago (Voicemail)",
        experience: "11 Years",
        calls: [],
      },
      {
        id: "c54",
        forename: "Addison",
        surname: "Bailey",
        telMobile: "+447389012346",
        email: "addison.bailey@example.com",
        callStatus: "user_declined",
        availableToWork: false,
        interested: false,
        knowReferee: null,
        lastContact: "10 days ago (Declined)",
        experience: "2 Years",
        calls: [],
      },
      {
        id: "c55",
        forename: "Isaac",
        surname: "Rivera",
        telMobile: "+447290123457",
        email: "isaac.rivera@example.com",
        callStatus: "agent_hangup",
        availableToWork: true,
        interested: null,
        knowReferee: false,
        lastContact: "1 day ago (Failed)",
        experience: "8 Years",
        calls: [],
      },
      {
        id: "c56",
        forename: "Aubrey",
        surname: "Cooper",
        telMobile: "+447201234568",
        email: "aubrey.cooper@example.com",
        callStatus: "no_answer",
        availableToWork: null,
        interested: null,
        knowReferee: null,
        lastContact: "10 hours ago (No Answer)",
        experience: "4 Years",
        calls: [],
      },
      {
        id: "c57",
        forename: "Gabriel",
        surname: "Richardson",
        telMobile: "+447112345679",
        email: "gabriel.richardson@example.com",
        callStatus: "voicemail",
        availableToWork: true,
        interested: true,
        knowReferee: false,
        lastContact: "3 hours ago (Voicemail)",
        experience: "10 Years",
        calls: [],
      },
      {
        id: "c58",
        forename: "Eleanor",
        surname: "Cox",
        telMobile: "+447823456780",
        email: "eleanor.cox@example.com",
        callStatus: "user_hangup",
        availableToWork: false,
        interested: false,
        knowReferee: null,
        lastContact: "7 days ago (Hung Up)",
        experience: "3 Years",
        calls: [],
      },
      {
        id: "c59",
        forename: "Owen",
        surname: "Howard",
        telMobile: "+447734567891",
        email: "owen.howard@example.com",
        callStatus: "agent_hangup",
        availableToWork: true,
        interested: null,
        knowReferee: true,
        lastContact: "2 days ago (Failed)",
        experience: "7 Years",
        calls: [],
      },
      {
        id: "c60",
        forename: "Hazel",
        surname: "Ward",
        telMobile: "+447645678902",
        email: "hazel.ward@example.com",
        callStatus: "no_answer",
        availableToWork: null,
        interested: null,
        knowReferee: null,
        lastContact: "6 hours ago (No Answer)",
        experience: "6 Years",
        calls: [],
      },
    ],
  },
];

export const getCampaignById = (id: string): Campaign | undefined => {
  return campaignsData.find((campaign) => campaign.id === id);
};

export const getCampaignsByJobId = (jobId: string): Campaign[] => {
  return campaignsData.filter((campaign) => campaign.jobId === jobId);
};
