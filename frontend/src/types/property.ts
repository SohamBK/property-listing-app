export interface Configuration {
  id: string;
  bhk: number;
  price: number;
  unitSize: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  businessName: string;
  phone: string;
}

export interface Property {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  type: "RESIDENTIAL" | "COMMERCIAL";
  listingType: string;
  location: string;
  possessionDate?: string;
  configurations: Configuration[];
  media: any[];
  agentId: string;
  agent: Agent;
}
