// Mock data for the DEMS frontend. In production these would come from a backend API.
// Kept in one place so the UI reads clean and swapping in real endpoints is trivial.

// ---- Roles ----
export const ROLES = {
  UPLOADER: { name: 'Uploader',  permissions: ['view', 'upload'] },
  READER:   { name: 'Reader',    permissions: ['view'] },
  DISTRICT_DM: { name: 'District DM', permissions: ['view', 'district_view'] },
}

// ---- Location hierarchy (State → District → Thana) ----
export const LOCATION_HIERARCHY = {
  'Uttar Pradesh': {
    'Ghaziabad': [
      'Ghaziabad Kotwali PS', 'Sihani Gate PS', 'Kavinagar PS', 'Indirapuram PS',
      'Sahibabad PS', 'Link Road PS', 'Nandgram PS', 'Crossings Republik PS',
      'Madhuban Bapudham PS', 'Masuri PS', 'Loni Border PS', 'Muradnagar PS',
    ],
  },
}

// ---- Auto-generate credentials for every thana ----
// Each thana gets exactly 2 users: one uploader, one reader.
// Email format: thanaslug.uploader@dems.gov  /  thanaslug.reader@dems.gov
// Default password for all demo accounts: dems2026

function slugify(thana) {
  return thana
    .toLowerCase()
    .replace(/\s+ps$/i, '')   // drop trailing " PS"
    .replace(/[^a-z0-9]+/g, '') // remove spaces & special chars
}

let _uid = 0
export const DEMO_USERS = []
const _allThanas = []

for (const [state, districts] of Object.entries(LOCATION_HIERARCHY)) {
  for (const [district, thanas] of Object.entries(districts)) {
    for (const thana of thanas) {
      const slug = slugify(thana)
      _allThanas.push({ thana, state, district })
      DEMO_USERS.push({
        id: ++_uid,
        name: `${thana} — Uploader`,
        role: 'UPLOADER',
        email: `${slug}.uploader@dems.gov`,
        password: 'dems2026',
        thana, state, district,
      })
      DEMO_USERS.push({
        id: ++_uid,
        name: `${thana} — Reader`,
        role: 'READER',
        email: `${slug}.reader@dems.gov`,
        password: 'dems2026',
        thana, state, district,
      })
    }

    DEMO_USERS.push({
      id: ++_uid,
      name: 'Ghaziabad District Magistrate',
      role: 'DISTRICT_DM',
      email: 'ghaziabad.dm@dems.gov',
      password: 'dems2026',
      thana: null,
      state: 'Uttar Pradesh',
      district: 'Ghaziabad',
    })
  }
}

// Helper: look up a user by email+password
export function authenticateUser(email, password) {
  const e = email.trim().toLowerCase()
  return DEMO_USERS.find(
    (u) => u.email === e && u.password === password
  ) || null
}

// ---- Synthetic demonstration cases (not real police records) ----
const CASE_TEMPLATES = [
  ['Digital payment fraud review', 'High'],
  ['Vehicle theft evidence file', 'Medium'],
  ['Cyber harassment complaint', 'High'],
  ['Property document verification', 'Medium'],
  ['Missing person investigation', 'High'],
]

const GENERATED_CASES = LOCATION_HIERARCHY['Uttar Pradesh'].Ghaziabad.flatMap((thana, stationIndex) =>
  CASE_TEMPLATES.map(([title, priority], caseIndex) => ({
    id: `GZ-${String(stationIndex * CASE_TEMPLATES.length + caseIndex + 1).padStart(3, '0')}`,
    title: `${title} — ${thana.replace(/ PS$/, '')}`,
    state: 'Uttar Pradesh',
    district: 'Ghaziabad',
    thana,
    stage: ['Active', 'Under Review', 'Closed'][caseIndex % 3],
    priority,
    updated: 'Today',
    suspect: { name: `Synthetic Subject ${stationIndex + 1}-${caseIndex + 1}`, email: 'not-real@example.invalid' },
  })),
)

const LEGACY_CASES = [
  // Maharashtra — Mumbai
  { id: 'C-1042', title: 'Cyber Fraud Investigation',       state: 'Maharashtra', district: 'Mumbai',  thana: 'Andheri PS',        stage: 'Active',       priority: 'High',   updated: '2h ago',  suspect: { name: 'Vikram Desai',    email: 'vikram.desai@mail.com'   } },
  { id: 'C-1055', title: 'Online Banking Scam',             state: 'Maharashtra', district: 'Mumbai',  thana: 'Andheri PS',        stage: 'Under Review', priority: 'High',   updated: '6h ago',  suspect: { name: 'Pooja Mehta',     email: 'pooja.mehta@mail.com'    } },
  { id: 'C-1041', title: 'Suspected Data Theft',            state: 'Maharashtra', district: 'Mumbai',  thana: 'Bandra PS',         stage: 'Under Review', priority: 'High',   updated: '5h ago',  suspect: { name: 'Arjun Kapoor',    email: 'arjun.kapoor@mail.com'   } },
  { id: 'C-1056', title: 'Hit-and-Run CCTV Evidence',       state: 'Maharashtra', district: 'Mumbai',  thana: 'Colaba PS',         stage: 'Active',       priority: 'Medium', updated: '1d ago',  suspect: { name: 'Suresh Patil',    email: 'suresh.patil@mail.com'   } },
  { id: 'C-1063', title: 'Drug Trafficking Ring',           state: 'Maharashtra', district: 'Mumbai',  thana: 'Juhu PS',           stage: 'Active',       priority: 'High',   updated: '4h ago',  suspect: { name: 'Farid Khan',      email: 'farid.khan@mail.com'     } },
  // Maharashtra — Pune
  { id: 'C-1040', title: 'Document Forgery Case',           state: 'Maharashtra', district: 'Pune',    thana: 'Deccan PS',         stage: 'Active',       priority: 'Medium', updated: '1d ago',  suspect: { name: 'Anand Joshi',     email: 'anand.joshi@mail.com'    } },
  { id: 'C-1057', title: 'Land Grab Conspiracy',            state: 'Maharashtra', district: 'Pune',    thana: 'Koregaon Park PS',  stage: 'Active',       priority: 'High',   updated: '12h ago', suspect: { name: 'Deepak Kulkarni',  email: 'deepak.kulkarni@mail.com'} },
  { id: 'C-1058', title: 'College Ragging Incident',        state: 'Maharashtra', district: 'Pune',    thana: 'Shivajinagar PS',   stage: 'Closed',       priority: 'Low',    updated: '5d ago',  suspect: { name: 'Rohit Pawar',     email: 'rohit.pawar@mail.com'    } },
  // Maharashtra — Nagpur
  { id: 'C-1064', title: 'Illegal Mining Evidence',         state: 'Maharashtra', district: 'Nagpur',  thana: 'Sitabuldi PS',      stage: 'Active',       priority: 'Medium', updated: '2d ago',  suspect: { name: 'Manoj Bhonsle',   email: 'manoj.bhonsle@mail.com'  } },
  { id: 'C-1065', title: 'Communal Tension Investigation',  state: 'Maharashtra', district: 'Nagpur',  thana: 'Sadar PS',          stage: 'Under Review', priority: 'High',   updated: '8h ago',  suspect: { name: 'Irfan Siddiqui',  email: 'irfan.siddiqui@mail.com' } },

  // Gujarat — Ahmedabad
  { id: 'C-1039', title: 'Missing Person Evidence',         state: 'Gujarat', district: 'Ahmedabad', thana: 'Navrangpura PS',  stage: 'Closed',       priority: 'Low',    updated: '3d ago',  suspect: { name: 'Kiran Patel',     email: 'kiran.patel@mail.com'    } },
  { id: 'C-1059', title: 'Ponzi Scheme Investigation',      state: 'Gujarat', district: 'Ahmedabad', thana: 'Ellisbridge PS',  stage: 'Active',       priority: 'High',   updated: '1d ago',  suspect: { name: 'Nitin Shah',      email: 'nitin.shah@mail.com'     } },
  { id: 'C-1066', title: 'Fake Passport Syndicate',         state: 'Gujarat', district: 'Ahmedabad', thana: 'Vastrapur PS',    stage: 'Active',       priority: 'High',   updated: '3h ago',  suspect: { name: 'Ravi Thakkar',    email: 'ravi.thakkar@mail.com'   } },
  // Gujarat — Surat
  { id: 'C-1038', title: 'Financial Fraud Audit',           state: 'Gujarat', district: 'Surat',     thana: 'Athwa PS',        stage: 'Under Review', priority: 'Medium', updated: '4d ago',  suspect: { name: 'Jayesh Modi',     email: 'jayesh.modi@mail.com'    } },
  { id: 'C-1060', title: 'Diamond Theft Case',              state: 'Gujarat', district: 'Surat',     thana: 'Adajan PS',       stage: 'Active',       priority: 'High',   updated: '8h ago',  suspect: { name: 'Haresh Savani',   email: 'haresh.savani@mail.com'  } },
  // Gujarat — Rajkot
  { id: 'C-1067', title: 'Cattle Smuggling Ring',           state: 'Gujarat', district: 'Rajkot',    thana: 'University PS',   stage: 'Under Review', priority: 'Medium', updated: '2d ago',  suspect: { name: 'Bharat Jadeja',   email: 'bharat.jadeja@mail.com'  } },

  // Delhi — New Delhi
  { id: 'C-1037', title: 'Property Dispute Records',        state: 'Delhi', district: 'New Delhi',   thana: 'Connaught Place PS',    stage: 'Active',       priority: 'Low',    updated: '6d ago',  suspect: { name: 'Sanjeev Gupta',   email: 'sanjeev.gupta@mail.com'  } },
  { id: 'C-1061', title: 'VIP Threat Assessment',           state: 'Delhi', district: 'New Delhi',   thana: 'Chanakyapuri PS',       stage: 'Active',       priority: 'High',   updated: '30m ago', suspect: { name: 'Anil Malhotra',   email: 'anil.malhotra@mail.com'  } },
  { id: 'C-1068', title: 'Parliament Security Breach',      state: 'Delhi', district: 'New Delhi',   thana: 'Parliament Street PS',  stage: 'Under Review', priority: 'High',   updated: '1h ago',  suspect: { name: 'Rajendra Tiwari', email: 'rajendra.tiwari@mail.com'} },
  // Delhi — South Delhi
  { id: 'C-1069', title: 'University Campus Assault',       state: 'Delhi', district: 'South Delhi', thana: 'Hauz Khas PS',          stage: 'Closed',       priority: 'Medium', updated: '7d ago',  suspect: { name: 'Gaurav Saxena',   email: 'gaurav.saxena@mail.com'  } },
  { id: 'C-1070', title: 'Luxury Car Theft Syndicate',      state: 'Delhi', district: 'South Delhi', thana: 'Saket PS',              stage: 'Active',       priority: 'High',   updated: '5h ago',  suspect: { name: 'Manish Bhatia',   email: 'manish.bhatia@mail.com'  } },
  // Delhi — North Delhi
  { id: 'C-1071', title: 'Heritage Site Vandalism',         state: 'Delhi', district: 'North Delhi', thana: 'Kashmere Gate PS',      stage: 'Active',       priority: 'Low',    updated: '3d ago',  suspect: { name: 'Pankaj Srivastava', email: 'pankaj.sri@mail.com'   } },

  // Karnataka — Bengaluru Urban
  { id: 'C-1062', title: 'IT Firm Embezzlement',            state: 'Karnataka', district: 'Bengaluru Urban', thana: 'Cubbon Park PS',    stage: 'Under Review', priority: 'High',   updated: '2h ago',  suspect: { name: 'Srinivas Rao',    email: 'srinivas.rao@mail.com'   } },
  { id: 'C-1072', title: 'Startup Investment Fraud',        state: 'Karnataka', district: 'Bengaluru Urban', thana: 'Indiranagar PS',    stage: 'Active',       priority: 'Medium', updated: '1d ago',  suspect: { name: 'Pradeep Hegde',   email: 'pradeep.hegde@mail.com'  } },
  { id: 'C-1073', title: 'Ransomware Attack on Hospital',   state: 'Karnataka', district: 'Bengaluru Urban', thana: 'Whitefield PS',     stage: 'Active',       priority: 'High',   updated: '6h ago',  suspect: { name: 'Naveen Kumar',    email: 'naveen.kumar@mail.com'   } },
  { id: 'C-1074', title: 'Nightclub Brawl CCTV',           state: 'Karnataka', district: 'Bengaluru Urban', thana: 'Koramangala PS',    stage: 'Closed',       priority: 'Low',    updated: '10d ago', suspect: { name: 'Arun Gowda',      email: 'arun.gowda@mail.com'     } },
  // Karnataka — Mysuru
  { id: 'C-1075', title: 'Temple Artifact Smuggling',       state: 'Karnataka', district: 'Mysuru',          thana: 'Devaraja PS',       stage: 'Active',       priority: 'Medium', updated: '2d ago',  suspect: { name: 'Mahesh Shetty',   email: 'mahesh.shetty@mail.com'  } },

  // Rajasthan — Jaipur
  { id: 'C-1076', title: 'Tourist Robbery at Palace',       state: 'Rajasthan', district: 'Jaipur',  thana: 'MI Road PS',          stage: 'Closed',       priority: 'Medium', updated: '8d ago',  suspect: { name: 'Gopal Singh',     email: 'gopal.singh@mail.com'    } },
  { id: 'C-1077', title: 'Gem Market Counterfeit Ring',     state: 'Rajasthan', district: 'Jaipur',  thana: 'Jhotwara PS',         stage: 'Active',       priority: 'High',   updated: '1d ago',  suspect: { name: 'Laxman Choudhary', email: 'laxman.c@mail.com'      } },
  // Rajasthan — Jodhpur
  { id: 'C-1078', title: 'Desert Safari Accident',          state: 'Rajasthan', district: 'Jodhpur', thana: 'Ratanada PS',         stage: 'Closed',       priority: 'Low',    updated: '12d ago', suspect: { name: 'Dinesh Rathore',  email: 'dinesh.rathore@mail.com' } },
  // Rajasthan — Udaipur
  { id: 'C-1079', title: 'Hotel Fire Arson Suspicion',      state: 'Rajasthan', district: 'Udaipur', thana: 'Hiran Magri PS',      stage: 'Under Review', priority: 'High',   updated: '3d ago',  suspect: { name: 'Suraj Mewar',     email: 'suraj.mewar@mail.com'    } },
  // Uttar Pradesh — Ghaziabad district
  { id: 'GZ-1001', title: 'Commercial Fraud Inquiry', state: 'Uttar Pradesh', district: 'Ghaziabad', thana: 'Ghaziabad Kotwali PS', stage: 'Active', priority: 'High', updated: 'Today', suspect: { name: 'Amit Verma', email: 'amit.verma@example.com' } },
  { id: 'GZ-1002', title: 'Vehicle Theft Investigation', state: 'Uttar Pradesh', district: 'Ghaziabad', thana: 'Sihani Gate PS', stage: 'Under Review', priority: 'Medium', updated: 'Today', suspect: { name: 'Rakesh Sharma', email: 'rakesh.sharma@example.com' } },
  { id: 'GZ-1003', title: 'Online Identity Fraud', state: 'Uttar Pradesh', district: 'Ghaziabad', thana: 'Kavinagar PS', stage: 'Active', priority: 'High', updated: 'Today', suspect: { name: 'Neha Gupta', email: 'neha.gupta@example.com' } },
  { id: 'GZ-1004', title: 'Property Document Dispute', state: 'Uttar Pradesh', district: 'Ghaziabad', thana: 'Indirapuram PS', stage: 'Under Review', priority: 'Medium', updated: 'Today', suspect: { name: 'Rohit Arora', email: 'rohit.arora@example.com' } },
  { id: 'GZ-1005', title: 'Robbery Case Evidence', state: 'Uttar Pradesh', district: 'Ghaziabad', thana: 'Sahibabad PS', stage: 'Active', priority: 'High', updated: 'Today', suspect: { name: 'Sandeep Yadav', email: 'sandeep.yadav@example.com' } },
  { id: 'GZ-1006', title: 'Industrial Safety Complaint', state: 'Uttar Pradesh', district: 'Ghaziabad', thana: 'Link Road PS', stage: 'Closed', priority: 'Low', updated: 'Today', suspect: { name: 'Vikas Jain', email: 'vikas.jain@example.com' } },
  { id: 'GZ-1007', title: 'Missing Person Report', state: 'Uttar Pradesh', district: 'Ghaziabad', thana: 'Nandgram PS', stage: 'Active', priority: 'High', updated: 'Today', suspect: { name: 'Pankaj Singh', email: 'pankaj.singh@example.com' } },
  { id: 'GZ-1008', title: 'Cyber Harassment Complaint', state: 'Uttar Pradesh', district: 'Ghaziabad', thana: 'Crossings Republik PS', stage: 'Under Review', priority: 'Medium', updated: 'Today', suspect: { name: 'Manish Tyagi', email: 'manish.tyagi@example.com' } },
  { id: 'GZ-1009', title: 'Warehouse Break-in', state: 'Uttar Pradesh', district: 'Ghaziabad', thana: 'Madhuban Bapudham PS', stage: 'Active', priority: 'High', updated: 'Today', suspect: { name: 'Kunal Mehra', email: 'kunal.mehra@example.com' } },
  { id: 'GZ-1010', title: 'Illegal Sand Mining', state: 'Uttar Pradesh', district: 'Ghaziabad', thana: 'Masuri PS', stage: 'Under Review', priority: 'Medium', updated: 'Today', suspect: { name: 'Dinesh Kumar', email: 'dinesh.kumar@example.com' } },
  { id: 'GZ-1011', title: 'Border Checkpoint Seizure', state: 'Uttar Pradesh', district: 'Ghaziabad', thana: 'Loni Border PS', stage: 'Active', priority: 'High', updated: 'Today', suspect: { name: 'Faizan Ali', email: 'faizan.ali@example.com' } },
  { id: 'GZ-1012', title: 'Public Disturbance Inquiry', state: 'Uttar Pradesh', district: 'Ghaziabad', thana: 'Muradnagar PS', stage: 'Closed', priority: 'Low', updated: 'Today', suspect: { name: 'Harish Pal', email: 'harish.pal@example.com' } },
]

// Current rollout scope: Uttar Pradesh → Ghaziabad → its police stations.
export const CASES = [...GENERATED_CASES, ...LEGACY_CASES].filter((item) => (
  item.state === 'Uttar Pradesh' && item.district === 'Ghaziabad'
))

const STORED_CASES_KEY = 'dems_cases'

export function getCases() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORED_CASES_KEY) || '[]')
    return [...stored, ...CASES]
  } catch {
    return [...CASES]
  }
}

export function addCase(caseRecord) {
  const stored = JSON.parse(localStorage.getItem(STORED_CASES_KEY) || '[]')
  localStorage.setItem(STORED_CASES_KEY, JSON.stringify([caseRecord, ...stored]))
  return caseRecord
}

export function getCasesForUser(user) {
  const cases = getCases()
  if (user?.role === 'DISTRICT_DM') {
    return cases.filter((item) => item.state === user.state && item.district === user.district)
  }
  return cases.filter((item) => item.thana === user?.thana)
}

export function formatDateTime(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(value))
}

// ---- Documents (evidence files) — tagged to a case ----
export const DOCUMENTS = CASES.map((caseItem, index) => ({
  id: `DOC-GZ-${String(index + 1).padStart(3, '0')}`,
  caseId: caseItem.id,
  name: `synthetic_case_record_${caseItem.id.toLowerCase()}.pdf`,
  size: '1.2 KB',
  type: 'PDF',
  uploaded: 'Today',
  status: index % 3 === 0 ? 'Pending' : 'Verified',
  thana: caseItem.thana,
  previewText: `DEMS SYNTHETIC DEMONSTRATION RECORD\n\nCase: ${caseItem.id}\nTitle: ${caseItem.title}\nState: Uttar Pradesh\nDistrict: Ghaziabad\nPolice station: ${caseItem.thana}\nPriority: ${caseItem.priority}\nStatus: ${caseItem.stage}\n\nThis document contains fictional training data only. It is not an authentic police record and must not be used as evidence.`,
}))

// ---- Recent activity (audit-style feed) ----
export const ACTIVITY = DOCUMENTS.slice(0, 8).map((document, index) => ({
  actor: `${document.thana} — ${index % 2 ? 'Reader' : 'Uploader'}`,
  action: index % 2 ? 'viewed' : 'uploaded',
  target: document.id,
  district: 'Ghaziabad',
  time: 'Today',
}))

export function getActivityForUser(user) {
  let stored = []
  try {
    stored = JSON.parse(localStorage.getItem('dems_activity') || '[]')
  } catch {
    stored = []
  }
  const activity = [...stored, ...ACTIVITY]
  if (user?.role === 'DISTRICT_DM') {
    return activity.filter((item) => item.district === user.district || item.actor.includes(user.district))
  }
  return activity.filter((item) => item.actor.startsWith(user?.thana || ''))
}

export function addActivity(entry) {
  const stored = JSON.parse(localStorage.getItem('dems_activity') || '[]')
  localStorage.setItem('dems_activity', JSON.stringify([{ ...entry, district: entry.district || 'Ghaziabad' }, ...stored]))
}

// ---- Case load trend (for the chart) ----
export const CASE_TREND = [
  { month: 'Apr', cases: 18 },
  { month: 'May', cases: 24 },
  { month: 'Jun', cases: 20 },
  { month: 'Jul', cases: 29 },
  { month: 'Aug', cases: 33 },
  { month: 'Sep', cases: 31 },
]
