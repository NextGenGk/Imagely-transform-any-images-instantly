import fs from 'fs';
import path from 'path';
import { cn } from '@/lib/utils';
import {
  IconAdjustmentsBolt,
  IconCloud,
  IconCurrencyDollar,
  IconEaseInOut,
  IconHeart,
  IconHelp,
  IconRouteAltLeft,
  IconTerminal2,
} from '@tabler/icons-react';

// Server component: read features from FEATURES_LIST.md and render
export default function FeaturesSectionDemo() {
  const mdPath = path.join(process.cwd(), 'FEATURES_LIST.md');
  let md = '';
  try {
    md = fs.readFileSync(mdPath, 'utf8');
  } catch (err) {
    // fallback to hardcoded features defined below
    console.error('FEATURES_LIST.md not found or unreadable', err);
  }

  const parsed = parseFeaturesFromMarkdown(md);

  // fallback default icons list (one per feature)
  const icons = [
    <IconTerminal2 key="i0" />,
    <IconEaseInOut key="i1" />,
    <IconCurrencyDollar key="i2" />,
    <IconCloud key="i3" />,
    <IconRouteAltLeft key="i4" />,
    <IconHelp key="i5" />,
    <IconAdjustmentsBolt key="i6" />,
    <IconHeart key="i7" />,
  ];

  const features = parsed.length
    ? parsed
    : [
        { title: 'Built for developers', description: 'Built for engineers, developers, dreamers, thinkers and doers.' },
        { title: 'Ease of use', description: "It's as easy as using an Apple, and as expensive as buying one." },
        { title: 'Pricing like no other', description: 'Our prices are best in the market. No cap, no lock, no credit card required.' },
        { title: '100% Uptime guarantee', description: 'We just cannot be taken down by anyone.' },
        { title: 'Multi-tenant Architecture', description: 'You can simply share passwords instead of buying new seats' },
        { title: '24/7 Customer Support', description: 'We are available a 100% of the time. Atleast our AI Agents are.' },
        { title: 'Money back guarantee', description: 'If you donot like EveryAI, we will convince you to like us.' },
        { title: 'And everything else', description: 'I just ran out of copy ideas. Accept my sincere apologies' },
      ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
      {features.slice(0, 8).map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} icon={icons[index % icons.length]} />
      ))}
    </div>
  );
}

function parseFeaturesFromMarkdown(md: string) {
  if (!md) return [];
  // Find the '✅ Fully Implemented & Working' section
  const sectionMatch = md.match(/##\s+✅\s+Fully Implemented & Working([\s\S]*?)(?:\n##|$)/);
  const section = sectionMatch ? sectionMatch[1] : md;

  const lines = section.split(/\r?\n/);
  const features: Array<{ title: string; description: string }> = [];
  const re = /^\s*-\s\*\*(.+?)\*\*\s*-\s*(.+)$/;
  for (const line of lines) {
    const m = line.match(re);
    if (m) {
      features.push({ title: m[1].trim(), description: m[2].trim() });
    }
    if (features.length >= 8) break;
  }
  return features;
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        'flex flex-col lg:border-r py-10 relative group/feature dark:border-neutral-800',
        (index === 0 || index === 4) && 'lg:border-l dark:border-neutral-800',
        index < 4 && 'lg:border-b dark:border-neutral-800'
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-linear-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-linear-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
