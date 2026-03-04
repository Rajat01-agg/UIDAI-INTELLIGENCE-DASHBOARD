import React from 'react';

export type View = 'home' | 'docs';

export interface NavItem {
  label: string;
  href: string;
  action?: () => void;
}

export interface StatItem {
  label: string;
  value: string;
  description: string;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export enum ChatSender {
  USER = 'user',
  BOT = 'bot',
  SYSTEM = 'system'
}

export interface ChatMessage {
  id: string;
  sender: ChatSender;
  text: string;
  timestamp: Date;
}