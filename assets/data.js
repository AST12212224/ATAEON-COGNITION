/*
  ATAEON Cognition — site content.
  Edit this file to add news, research areas, papers or products.
  Every page reads from here, so you never have to touch the HTML for new content.
  Lists are shown in the order written (put the newest first).
*/
window.SITE = {
  email: 'support@ataeoncognition.com',
  launch: '2026-11-08T00:00:00+05:30', // LabourVala launch (Diwali). Countdown turns into "LIVE" after this.

  // News / milestones. upcoming:true shows a pulsing amber dot.
  updates: [
    { when: '8 Nov 2026', tag: 'Launch', title: 'LabourVala goes live', text: 'Our first product launches this Diwali, starting in Chhatrapati Sambhajinagar.', upcoming: true },
    { when: 'Oct 2026', tag: 'Engineering', title: 'Platform fully on AWS', text: 'LabourVala\'s website, backend, database and billing now run on AWS in Mumbai (ap-south-1).' },
    { when: 'Sep 2026', tag: 'Recognition', title: 'DPIIT-recognised startup', text: 'Recognised by DPIIT under Startup India (certificate DIPP282717).' },
    { when: 'Sep 2026', tag: 'Programme', title: 'Joined AWS Activate', text: 'Selected for AWS Activate, supporting our cloud infrastructure.' },
    { when: '27 Jul 2026', tag: 'Compliance', title: 'GST registered', text: 'GSTIN 27ABGCA2190P1Z8 issued, with GST invoicing built into our products.' },
    { when: '20 Jul 2026', tag: 'Company', title: 'ATAEON Cognition incorporated', text: 'Incorporated as a private limited company under the Companies Act, 2013.' }
  ],

  // Research areas. area must be one of: Mathematics, AI, Applied
  // status: 'Active' or 'Exploring'
  research: [
    { area: 'Mathematics', icon: '∑', title: 'Mathematical foundations of learning', text: 'Why learning systems generalise: approximation theory, probability in high dimensions and the geometry of loss landscapes.', status: 'Active', tags: ['Theory', 'Probability'] },
    { area: 'Mathematics', icon: '∇', title: 'Optimisation & numerical methods', text: 'Fast, stable algorithms for large-scale optimisation, from convex methods to the training dynamics of neural networks.', status: 'Active', tags: ['Optimisation', 'Numerics'] },
    { area: 'Mathematics', icon: '◎', title: 'Geometry & topology of data', text: 'Using manifolds, graphs and topological signals to understand structure hidden in real-world data.', status: 'Exploring', tags: ['Geometry', 'TDA'] },
    { area: 'AI', icon: 'अ', title: 'Language AI for Bharat', text: 'Models that understand Marathi, Hindi and code-mixed speech and text, built for low-bandwidth, first-time users.', status: 'Exploring', tags: ['NLP', 'Speech', 'Indic'] },
    { area: 'AI', icon: '◇', title: 'Trustworthy & explainable AI', text: 'Making model decisions auditable and fair when they affect people\'s livelihoods.', status: 'Exploring', tags: ['Fairness', 'XAI'] },
    { area: 'AI', icon: '⌖', title: 'Geospatial intelligence', text: 'Forecasting local demand for work and services from location and time patterns.', status: 'Exploring', tags: ['Forecasting', 'Spatial'] },
    { area: 'Applied', icon: '⇄', title: 'Matching markets & mechanism design', text: 'Fair, efficient two-sided matching for labour markets: who should be matched with whom, and at what cost.', status: 'Active', tags: ['Game theory', 'LabourVala'] },
    { area: 'Applied', icon: '★', title: 'Reputation & trust systems', text: 'Rating aggregation that resists manipulation and gives new workers a fair start.', status: 'Active', tags: ['Statistics', 'LabourVala'] }
  ],

  // Papers, preprints, technical notes. Leave empty until you publish.
  // Example: { year: 2027, title: 'Paper title', venue: 'arXiv', url: 'https://arxiv.org/abs/...', area: 'Mathematics' }
  papers: [],

  // Products in the pipeline (LabourVala has its own section).
  // These two are placeholders. Rename or replace them with your real plans.
  pipeline: [
    { name: 'Product Λ-02', status: 'In stealth', kind: 'lab', text: 'Our next product for Bharat, built on what we learn from LabourVala. More soon.' },
    { name: 'Research releases', status: 'Planned', kind: 'soon', text: 'Open notes, code and tools from our mathematics and AI research.' }
  ],

  // Lines typed in the terminal on the Solutions page.
  terminal: [
    '<span class="gr">➜</span> <span class="c">ataeon</span> analyse --problem <span class="v">daily-wage-hiring</span>',
    '<span class="d">  ✓ trust gap: no identity, no track record</span>',
    '<span class="d">  ✓ waste: no-shows, idle mornings, middlemen</span>',
    '<span class="gr">➜</span> <span class="c">ataeon</span> build <span class="v">labourvala</span>',
    '  <span class="am">[████████████████████]</span> 100%',
    '  <span class="gr">✔ digilocker_kyc</span>      ready',
    '  <span class="gr">✔ gps_matching</span>        ready',
    '  <span class="gr">✔ atomic_hire_tx</span>      ready',
    '  <span class="gr">✔ arrival_code</span>        ready',
    '  <span class="gr">✔ gst_invoicing</span>       ready',
    '<span class="gr">➜</span> <span class="c">ataeon</span> deploy --cloud <span class="v">aws</span> --region <span class="v">ap-south-1</span>',
    '  🚀 launching this Diwali…'
  ]
};
