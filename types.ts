export type EntityType = 'CLIENT' | 'SERVER' | 'DATABASE';

export interface SimulationStep {
  id: number;
  title: string;
  description: string;
  source: EntityType;
  target: EntityType;
  // Code snippet to display
  codeLang: 'javascript' | 'java' | 'sql' | 'json';
  codeContent: string;
  // Payload explanation
  payloadType: 'Request' | 'Response' | 'Internal' | 'Query';
  payloadContent: string;
  // Highlighting specific simulation component parts
  activeComponent: string; // e.g., 'axios', 'controller', 'mapper', 'jwt'
}

export type ScenarioType = 'LOGIN' | 'FETCH_DATA';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}