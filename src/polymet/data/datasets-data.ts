export interface Candidate {
  id: string;
  name: string;
  phone: string;
  postcode?: string;
  location?: string;
  trade?: string;
  blueCard?: boolean;
  greenCard?: boolean;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  candidateCount: number;
  createdAt: string;
  lastUpdated: string;
  source: "csv" | "manual" | "imported";
  candidates: Candidate[];
}

export const datasetsData: Dataset[] = [
  {
    id: "ds1",
    name: "Steel Fixers - London",
    description: "Experienced steel fixers in London area",
    candidateCount: 8,
    createdAt: "2025-01-15",
    lastUpdated: "2025-02-10",
    source: "csv",
    candidates: [
      {
        id: "c1",
        name: "James Wilson",
        phone: "+447700900001",
        postcode: "E1 6AN",
        location: "London",
        trade: "Steel Fixer",
        blueCard: true,
        greenCard: false,
      },
      {
        id: "c2",
        name: "Mohammed Ali",
        phone: "+447700900002",
        postcode: "SE1 9SG",
        location: "London",
        trade: "Steel Fixer",
        blueCard: true,
        greenCard: true,
      },
      {
        id: "c3",
        name: "Robert Smith",
        phone: "+447700900003",
        location: "London",
        trade: "Steel Fixer",
        blueCard: false,
      },
      {
        id: "c4",
        name: "David Brown",
        phone: "+447700900004",
        postcode: "W1A 1AA",
        trade: "Steel Fixer",
        greenCard: true,
      },
      {
        id: "c5",
        name: "Michael Johnson",
        phone: "+447700900005",
        postcode: "SW1A 1AA",
        location: "London",
        trade: "Steel Fixer",
      },
      {
        id: "c6",
        name: "Thomas Davies",
        phone: "+447700900006",
        location: "London",
        blueCard: true,
      },
      {
        id: "c7",
        name: "Christopher Evans",
        phone: "+447700900007",
        postcode: "N1 9AG",
        trade: "Steel Fixer",
      },
      {
        id: "c8",
        name: "Daniel Williams",
        phone: "+447700900008",
        postcode: "EC1A 1BB",
        location: "London",
      },
    ],
  },
  {
    id: "ds2",
    name: "Site Engineers - UK Wide",
    description: "Qualified site engineers across UK",
    candidateCount: 6,
    createdAt: "2025-01-20",
    lastUpdated: "2025-02-08",
    source: "imported",
    candidates: [
      {
        id: "c9",
        name: "Sarah Thompson",
        phone: "+447700900009",
        postcode: "M1 1AE",
        location: "Manchester",
        trade: "Site Engineer",
        blueCard: true,
        greenCard: true,
      },
      {
        id: "c10",
        name: "Emily Roberts",
        phone: "+447700900010",
        location: "Birmingham",
        trade: "Site Engineer",
        blueCard: true,
      },
      {
        id: "c11",
        name: "Jessica Taylor",
        phone: "+447700900011",
        postcode: "LS1 1UR",
        trade: "Site Engineer",
      },
      {
        id: "c12",
        name: "Laura Anderson",
        phone: "+447700900012",
        postcode: "G1 1AA",
        location: "Glasgow",
        greenCard: true,
      },
      {
        id: "c13",
        name: "Sophie Martin",
        phone: "+447700900013",
        location: "Leeds",
        trade: "Site Engineer",
        blueCard: false,
      },
      {
        id: "c14",
        name: "Hannah White",
        phone: "+447700900014",
        postcode: "NE1 1EE",
        trade: "Site Engineer",
      },
    ],
  },
  {
    id: "ds3",
    name: "Plumbers - South East",
    description: "Licensed plumbers in South East region",
    candidateCount: 7,
    createdAt: "2025-01-10",
    lastUpdated: "2025-02-05",
    source: "csv",
    candidates: [
      {
        id: "c15",
        name: "Andrew Harris",
        phone: "+447700900015",
        postcode: "BN1 1AA",
        location: "Brighton",
        trade: "Plumber",
        blueCard: true,
      },
      {
        id: "c16",
        name: "Matthew Clark",
        phone: "+447700900016",
        location: "Southampton",
        trade: "Plumber",
      },
      {
        id: "c17",
        name: "Joshua Lewis",
        phone: "+447700900017",
        postcode: "RG1 1AA",
        trade: "Plumber",
        greenCard: true,
      },
      {
        id: "c18",
        name: "Ryan Walker",
        phone: "+447700900018",
        postcode: "GU1 1AA",
        location: "Guildford",
        blueCard: false,
      },
      {
        id: "c19",
        name: "Jack Hall",
        phone: "+447700900019",
        location: "Oxford",
        trade: "Plumber",
      },
      {
        id: "c20",
        name: "Luke Allen",
        phone: "+447700900020",
        postcode: "CT1 1AA",
        trade: "Plumber",
        blueCard: true,
      },
      {
        id: "c21",
        name: "Oliver Young",
        phone: "+447700900021",
        location: "Canterbury",
      },
    ],
  },
];

export function getDatasetById(id: string): Dataset | undefined {
  return datasetsData.find((dataset) => dataset.id === id);
}

export function getDatasetsByIds(ids: string[]): Dataset[] {
  return datasetsData.filter((dataset) => ids.includes(dataset.id));
}
