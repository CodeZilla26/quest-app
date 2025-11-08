"use client";
import { QuestProvider } from '../context/QuestContext';

export default function Providers({ children }) {
  return <QuestProvider>{children}</QuestProvider>;
}
