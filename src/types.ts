export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  icon: string;
  lastEdited: number;
  template: 'plain' | 'code' | 'checklist';
  image?: string;
}

export type Theme = 'light' | 'dark' | 'system';

export interface CodeBlock {
  id: string;
  language: string;
  code: string;
}

export type NoteTemplate = {
  type: 'plain' | 'code' | 'checklist';
  name: string;
  content: string;
  icon: string;
};