import { districts, constituencies, District, Constituency } from "./geo";

export type LeaderboardEntry = {
  id: string;
  name: string;
  roleEn: string;
  roleMl: string;
  districtId: string;
  constituencyId: string;
  casesResolved: number;
  points: number;
  avatarColor: string;
  avatarUrl?: string;
};

const profilePhotos = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
];

// Seed sample leaders across districts and mandalams
const leaderFirstNames = [
  "Suresh", "Anjali", "Rajesh", "Priya", "Vinod", "Deepa", "Harikrishnan", "Sunil",
  "Lakshmi", "Gokul", "Reshmi", "Arun", "Fathima", "Muhammed", "Kavya", "Vipin",
  "Anoop", "Sreedevi", "Mathew", "Divya", "Jayakrishnan", "Smitha", "Rahul", "Aswathy"
];

const leaderLastNames = [
  "Nair", "Kumar", "Varghese", "Menon", "Pillai", "Kutty", "Nambiar", "Sharif",
  "George", "Kurup", "Devi", "Das", "Varma", "Jose", "Shetty", "Moorthy"
];

const roles = [
  { en: "Mandal Coordinator", ml: "മണ്ഡലം കോർഡിനേറ്റർ" },
  { en: "Ward Lead", ml: "വാർഡ് ലീഡ്" },
  { en: "Booth In-Charge", ml: "ബൂത്ത് ഇൻ-ചാർജ്" },
  { en: "Nodal Volunteer", ml: "നോഡൽ വോളന്റിയർ" },
  { en: "District Lead", ml: "ജില്ലാ ലീഡ്" },
];

const avatarColors = [
  "bg-amber-500/20 text-amber-700 border-amber-500/30",
  "bg-blue-500/20 text-blue-700 border-blue-500/30",
  "bg-emerald-500/20 text-emerald-700 border-emerald-500/30",
  "bg-purple-500/20 text-purple-700 border-purple-500/30",
  "bg-teal-500/20 text-teal-700 border-teal-500/30",
  "bg-rose-500/20 text-rose-700 border-rose-500/30",
  "bg-indigo-500/20 text-indigo-700 border-indigo-500/30",
];

// Generate consistent mock data for all 140 mandalams
export function generateLeaderboardData(): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];
  let counter = 1;

  constituencies.forEach((c, idx) => {
    // 3 to 5 leaders per constituency
    const leaderCount = 3 + (idx % 3);
    for (let i = 0; i < leaderCount; i++) {
      const fn = leaderFirstNames[(counter * 7 + i * 3) % leaderFirstNames.length];
      const ln = leaderLastNames[(counter * 11 + i * 5) % leaderLastNames.length];
      const roleObj = roles[(i + idx) % roles.length];
      const points = 18000 - i * 1450 - (idx * 37) % 3000;
      const casesResolved = Math.floor(points / 600) + 5;

      entries.push({
        id: `lead-${c.id}-${i + 1}`,
        name: `${fn} ${ln}`,
        roleEn: roleObj.en,
        roleMl: roleObj.ml,
        districtId: c.districtId,
        constituencyId: c.id,
        casesResolved,
        points,
        avatarColor: avatarColors[(counter + i) % avatarColors.length],
        avatarUrl: profilePhotos[(counter + i) % profilePhotos.length],
      });
      counter++;
    }
  });

  return entries;
}

export const allLeaderboardEntries = generateLeaderboardData();

export function getFilteredLeaderboard(districtId?: string, constituencyId?: string): LeaderboardEntry[] {
  let list = [...allLeaderboardEntries];

  if (districtId && districtId !== "all") {
    list = list.filter((e) => e.districtId === districtId);
  }

  if (constituencyId && constituencyId !== "all") {
    list = list.filter((e) => e.constituencyId === constituencyId);
  }

  // Sort by points descending
  return list.sort((a, b) => b.points - a.points);
}
