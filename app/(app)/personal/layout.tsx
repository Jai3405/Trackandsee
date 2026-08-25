import { PersonalNav } from '@/components/personal-nav';

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PersonalNav />
      {children}
    </div>
  );
}
