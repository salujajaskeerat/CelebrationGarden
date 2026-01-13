// Seed invitations and scrapbook entries into Strapi
// Run: node scripts/seed-scrapbook.js
// Reads NEXT_PUBLIC_STRAPI_URL and STRAPI_API_TOKEN from .env file

const { readFileSync } = require('fs');
const { join } = require('path');

// Load .env file manually
const envPath = join(__dirname, '..', '.env');

let envVars = {};
try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmed.substring(0, equalIndex).trim();
        let value = trimmed.substring(equalIndex + 1).trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        envVars[key] = value;
      }
    }
  });
} catch (err) {
  console.warn(`Warning: Could not read .env file at ${envPath}: ${err.message}`);
}

// Use environment variables (from .env or process.env)
const STRAPI_URL = envVars.NEXT_PUBLIC_STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || envVars.STRAPI_URL || process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = envVars.STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN || envVars.STRAPI_TOKEN || process.env.STRAPI_TOKEN;

if (!STRAPI_TOKEN) {
  console.error('❌ Missing STRAPI_API_TOKEN in .env file or environment variables');
  console.error('   Please add STRAPI_API_TOKEN=your_token_here to your .env file');
  process.exit(1);
}

console.log(`📡 Using Strapi URL: ${STRAPI_URL}`);
console.log(`🔑 API Token: ${STRAPI_TOKEN.substring(0, 10)}...`);

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${STRAPI_TOKEN}`,
};

// Check if fetch is available (Node 18+ has it built-in)
if (typeof fetch === 'undefined') {
  console.error('❌ fetch is not available. Please use Node.js 18+ or run with: node --experimental-fetch scripts/seed-scrapbook.js');
  process.exit(1);
}

async function checkInvitationExists(slug) {
  try {
    const res = await fetch(`${STRAPI_URL}/api/invitations?filters[slug][$eq]=${encodeURIComponent(slug)}`, {
      headers,
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = Array.isArray(json.data) ? json.data : json.data ? [json.data] : [];
    return data.length > 0 ? data[0].id : null;
  } catch (err) {
    console.warn(`Warning checking invitation ${slug}: ${err.message}`);
    return null;
  }
}

async function createInvitation(invitation) {
  // Check if invitation already exists
  const existingId = await checkInvitationExists(invitation.slug);
  if (existingId) {
    console.log(`⚠️  Invitation ${invitation.slug} already exists (ID: ${existingId}), skipping creation`);
    return existingId;
  }

  const res = await fetch(`${STRAPI_URL}/api/invitations`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ data: invitation }),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Invite failed: ${res.status} ${errorText}`);
  }
  
  const json = await res.json();
  if (!json.data || !json.data.id) {
    throw new Error(`Invalid response: ${JSON.stringify(json)}`);
  }
  
  return json.data.id;
}

async function createEntry(entry) {
  const res = await fetch(`${STRAPI_URL}/api/scrapbook-entries`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ data: entry }),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Entry failed: ${res.status} ${errorText}`);
  }
  
  const json = await res.json();
  if (!json.data || !json.data.id) {
    throw new Error(`Invalid response: ${JSON.stringify(json)}`);
  }
  
  return json.data.id;
}

const invitations = [
  {
    title: "Sarah & Michael's Wedding",
    slug: 'sarah-michael-wedding',
    event_date: '2024-06-15',
    type: 'Wedding',
    subtitle: 'A Celebration of Love',
  },
  {
    title: "Ananya's 30th Birthday",
    slug: 'ananya-30th-bday',
    event_date: '2024-09-05',
    type: 'Birthday',
    subtitle: 'Cheers to 30',
  },
  {
    title: 'Aurora Labs Offsite',
    slug: 'aurora-labs-offsite',
    event_date: '2024-11-12',
    type: 'Corporate',
    subtitle: 'Team, Trust, Traction',
  },
];

// Public image URLs (Unsplash)
const imgs = [
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1524504388940-3f63b6f99b49?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1524504388940-a1f7e2c16f14?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1524504388940-1f3c6f1b78a4?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1524504388940-0c3c022d62c8?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1524504388940-1d3cbb8a5e7c?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1524504388940-f9c302d3b8e5?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1524504388940-6f3d6b7a3e8f?auto=format&fit=crop&w=300&q=80',
];
const img = (i) => imgs[i % imgs.length];

// Helper to generate phone numbers (max 20 chars per schema)
const phone = (n) => `+1-555-${String(n).padStart(4, '0')}`;

const entriesBySlug = {
  'sarah-michael-wedding': [
    { name: 'Emma', relation: "Bride's Friend", message: 'So happy for you both-an unforgettable day!', image_url: img(0), phone: phone(1001) },
    { name: 'James', relation: "Groom's Friend", message: 'Wishing you a lifetime of joy and adventures.', image_url: img(1), phone: phone(1002) },
    { name: 'Lisa', relation: "Bride's Friend", message: 'You looked stunning; the ceremony was perfect.', image_url: img(2), phone: phone(1003) },
    { name: 'David', relation: 'Mutual Friend', message: 'Cheers to the happiest couple I know!', image_url: img(3), phone: phone(1004) },
    { name: 'Sophia', relation: "Bride's Cousin", message: 'Family is so proud-may love keep blooming.', image_url: img(4), phone: phone(1005) },
    { name: 'Noah', relation: "Groom's Brother", message: 'Welcome to the family, Sarah. Much love.', image_url: img(5), phone: phone(1006) },
    { name: 'Olivia', relation: "Bride's Sister", message: 'Best sister ever-your smile said it all.', image_url: img(6), phone: phone(1007) },
    { name: 'Ethan', relation: "Groom's Colleague", message: 'Michael, you inspire us. Congrats to both!', image_url: img(7), phone: phone(1008) },
    { name: 'Mia', relation: 'Family Friend', message: 'A day of love and warmth-so happy for you.', image_url: img(8), phone: phone(1009) },
    { name: 'Lucas', relation: 'College Friend', message: 'From dorms to weddings-proud of you, man.', image_url: img(9), phone: phone(1010) },
    { name: 'Ava', relation: 'Childhood Friend', message: 'We dreamed of this day-so thrilled for you!', image_url: img(0), phone: phone(1011) },
    { name: 'Henry', relation: "Groom's Uncle", message: 'Family stands with you-blessings always.', image_url: img(1), phone: phone(1012) },
    { name: 'Grace', relation: "Bride's Aunt", message: 'Your vows were beautiful-love you both.', image_url: img(2), phone: phone(1013) },
    { name: 'Leo', relation: 'Best Man', message: 'Could not be prouder-legendary couple.', image_url: img(3), phone: phone(1014) },
    { name: 'Chloe', relation: 'Maid of Honor', message: 'Sarah, you glowed. Michael, you\'re lucky!', image_url: img(4), phone: phone(1015) },
    { name: 'Jack', relation: 'Neighbor', message: 'The venue was magic-cheers to forever.', image_url: img(5), phone: phone(1016) },
    { name: 'Ella', relation: 'School Friend', message: 'Still remember class notes-now wedding notes!', image_url: img(6), phone: phone(1017) },
    { name: 'Daniel', relation: 'College Roommate', message: 'You two are perfect; honored to witness it.', image_url: img(7), phone: phone(1018) },
    { name: 'Harper', relation: 'Family Friend', message: 'Love wins. Congratulations, dear ones.', image_url: img(8), phone: phone(1019) },
    { name: 'Wyatt', relation: 'Groom\'s Cousin', message: 'Proud cousin moment-celebrating you both.', image_url: img(9), phone: phone(1020) },
  ],
  'ananya-30th-bday': [
    { name: 'Rohan', relation: 'College Friend', message: 'Welcome to Club 30-best years ahead!', image_url: img(0), phone: phone(2001) },
    { name: 'Priya', relation: 'Sister', message: 'Proud of you-keep shining always.', image_url: img(1), phone: phone(2002) },
    { name: 'Karan', relation: 'Colleague', message: 'Your energy drives the team-happy 30th!', image_url: img(2), phone: phone(2003) },
    { name: 'Meera', relation: 'School Friend', message: 'Decade three: more travel, more laughs.', image_url: img(3), phone: phone(2004) },
    { name: 'Nikhil', relation: 'Cousin', message: 'Family loves you-party never stops.', image_url: img(4), phone: phone(2005) },
    { name: 'Aditi', relation: 'Best Friend', message: 'From hostel nights to this-love you!', image_url: img(5), phone: phone(2006) },
    { name: 'Sana', relation: 'Yoga Buddy', message: 'Balance, joy, and cake-happy birthday!', image_url: img(6), phone: phone(2007) },
    { name: 'Varun', relation: 'Running Partner', message: 'Next PR together-cheers to 30!', image_url: img(7), phone: phone(2008) },
    { name: 'Diya', relation: 'Neighbor', message: 'Your kindness lights the block-celebrate big.', image_url: img(8), phone: phone(2009) },
    { name: 'Ishaan', relation: 'Team Lead', message: 'Your leadership inspires-enjoy the milestone.', image_url: img(9), phone: phone(2010) },
    { name: 'Tara', relation: 'Travel Buddy', message: 'More stamps in passports-happy 30th!', image_url: img(0), phone: phone(2011) },
    { name: 'Kabir', relation: 'Book Club', message: 'New chapter unlocked-make it epic.', image_url: img(1), phone: phone(2012) },
    { name: 'Zara', relation: 'Childhood Friend', message: 'From swings to soirées-so proud of you.', image_url: img(2), phone: phone(2013) },
    { name: 'Arjun', relation: 'Cousin', message: 'Keep laughing loud-birthday cheers!', image_url: img(3), phone: phone(2014) },
    { name: 'Lavanya', relation: 'Mentor', message: 'Your growth is inspiring-happy birthday!', image_url: img(4), phone: phone(2015) },
    { name: 'Neeraj', relation: 'Colleague', message: 'Team star-have a fantastic 30th.', image_url: img(5), phone: phone(2016) },
  ],
  'aurora-labs-offsite': [
    { name: 'Maya', relation: 'Product Manager', message: 'Offsite vibe: aligned, energized, ready.', image_url: img(6), phone: phone(3001) },
    { name: 'Raj', relation: 'Engineer', message: 'Great sessions-learned a lot, laughed a lot.', image_url: img(7), phone: phone(3002) },
    { name: 'Carla', relation: 'Designer', message: 'Collabs were smooth-team chemistry is fire.', image_url: img(8), phone: phone(3003) },
    { name: 'Zane', relation: 'Data Scientist', message: 'Loved the roadmap talks-clear and bold.', image_url: img(9), phone: phone(3004) },
    { name: 'Amir', relation: 'CTO', message: 'Proud of the crew-best offsite yet.', image_url: img(0), phone: phone(3005) },
    { name: 'Lena', relation: 'Engineer', message: 'Work + beach walks = perfect combo.', image_url: img(1), phone: phone(3006) },
    { name: 'Diego', relation: 'QA', message: 'Quality time, literally-team is tighter.', image_url: img(2), phone: phone(3007) },
    { name: 'Hana', relation: 'HR', message: 'Loved the culture workshops-feels united.', image_url: img(3), phone: phone(3008) },
    { name: 'Ivy', relation: 'Marketing', message: 'Brand stories flowed-excited to launch.', image_url: img(4), phone: phone(3009) },
    { name: 'Felix', relation: 'Ops', message: 'Logistics smooth-next time even bigger.', image_url: img(5), phone: phone(3010) },
    { name: 'Yara', relation: 'Support', message: 'Happiest calls come from happiest teams.', image_url: img(6), phone: phone(3011) },
    { name: 'Omar', relation: 'Engineer', message: 'Hackathon ideas are fire. Let\'s ship them.', image_url: img(7), phone: phone(3012) },
    { name: 'Greta', relation: 'Finance', message: 'Budgets aligned, spirits high.', image_url: img(8), phone: phone(3013) },
    { name: 'Sam', relation: 'Founder', message: 'Teamwork on display-grateful for all.', image_url: img(9), phone: phone(3014) },
    { name: 'Timo', relation: 'Intern', message: 'Learned tons-thanks for the mentorship.', image_url: img(0), phone: phone(3015) },
    { name: 'Belle', relation: 'Recruiter', message: 'Hiring stories were gold-great bonds.', image_url: img(1), phone: phone(3016) },
    { name: 'Nora', relation: 'PM', message: 'Clear OKRs, clearer purpose-let\'s go.', image_url: img(2), phone: phone(3017) },
    { name: 'Ken', relation: 'Engineer', message: 'Code and karaoke-perfect offsite mix.', image_url: img(3), phone: phone(3018) },
    { name: 'Alec', relation: 'Designer', message: 'Sketching by the sea-creative spark!', image_url: img(4), phone: phone(3019) },
    { name: 'Jia', relation: 'Engineer', message: 'Team syncs felt effortless-great momentum.', image_url: img(5), phone: phone(3020) },
    { name: 'Uma', relation: 'Analyst', message: 'Data deep dives + sunsets = memorable.', image_url: img(6), phone: phone(3021) },
    { name: 'Pia', relation: 'Comms', message: 'Stories to share-team is ready to shine.', image_url: img(7), phone: phone(3022) },
    { name: 'Vik', relation: 'SRE', message: 'Infra chats were productive-resilient path.', image_url: img(8), phone: phone(3023) },
    { name: 'Quinn', relation: 'Engineer', message: 'Pairing sessions rocked-learned a ton.', image_url: img(9), phone: phone(3024) },
  ],
};

const totalEntries = Object.values(entriesBySlug).reduce((sum, arr) => sum + arr.length, 0);
console.log(`\n📊 Will create ${totalEntries} scrapbook entries across ${invitations.length} invitations.\n`);

async function main() {
  let successCount = 0;
  let errorCount = 0;

  for (const invitation of invitations) {
    try {
      const id = await createInvitation(invitation);
      console.log(`✅ Created invitation: ${invitation.slug} (ID: ${id})`);

      const entries = entriesBySlug[invitation.slug] || [];
      for (const entry of entries) {
        try {
          const entryId = await createEntry({
            name: entry.name,
            relation: entry.relation,
            message: entry.message,
            phone: entry.phone,
            image_url: entry.image_url,
            invitation: id,
            submitted_at: new Date().toISOString(),
          });
          console.log(`   ✓ Created entry: ${entry.name}`);
          successCount++;
        } catch (err) {
          console.error(`   ✗ Failed to create entry ${entry.name}: ${err.message}`);
          errorCount++;
        }
      }
      console.log('');
    } catch (err) {
      console.error(`✗ Failed to create invitation ${invitation.slug}: ${err.message}`);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Successfully created: ${successCount} entries`);
  if (errorCount > 0) {
    console.log(`❌ Failed: ${errorCount} entries`);
  }
  console.log('='.repeat(50));
  console.log('Seeding complete! 🎉\n');
}

main().catch((err) => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
