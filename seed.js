require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Board = require('./models/Board');
const Task = require('./models/Task');

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function createBoard(userId, name, columnTitles, taskDefs) {
  const board = await Board.create({
    name,
    userId,
    columns: columnTitles.map((title) => ({ title, taskIds: [] })),
  });

  const tasks = await Task.create(
    taskDefs.map((t) => ({ ...t, boardId: board._id })),
    { timestamps: false },
  );

  for (const col of board.columns) {
    col.taskIds = tasks.filter((t) => t.status === col.title).map((t) => t._id);
  }
  await board.save();
  return tasks.length;
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Promise.all([User.deleteMany(), Board.deleteMany(), Task.deleteMany()]);

  const user = await User.create({
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'password123',
  });

  let total = 0;

  // --- 1. Product Launch ---
  total += await createBoard(user._id, 'Product Launch', ['Todo', 'In Progress', 'Done'], [
    { title: 'Write press release', description: 'Draft and get approval from marketing lead', priority: 'high', status: 'Todo', labels: ['Marketing', 'Urgent'], dueDate: daysFromNow(2), createdAt: daysAgo(2) },
    { title: 'Prepare demo video', description: 'Record 2-min product walkthrough for landing page', priority: 'high', status: 'Todo', labels: ['Content'], dueDate: daysFromNow(5), createdAt: daysAgo(5) },
    { title: 'Set up analytics dashboard', description: 'Configure Mixpanel events for launch metrics', priority: 'medium', status: 'Todo', labels: ['Engineering'], dueDate: daysFromNow(7), createdAt: daysAgo(8) },
    { title: 'Social media campaign', description: 'Schedule posts across Twitter, LinkedIn, and Product Hunt', priority: 'medium', status: 'Todo', labels: ['Marketing', 'Content'], createdAt: daysAgo(12) },
    { title: 'Create email drip sequence', description: '5-email onboarding series for new signups', priority: 'medium', status: 'Todo', labels: ['Marketing'], createdAt: daysAgo(16) },
    { title: 'Finalize pricing page', description: 'Update tiers based on competitor analysis', priority: 'high', status: 'In Progress', labels: ['Design', 'Urgent'], dueDate: daysFromNow(1), createdAt: daysAgo(18) },
    { title: 'Beta user outreach', description: 'Email 50 beta users for testimonials', priority: 'medium', status: 'In Progress', labels: ['Marketing'], dueDate: daysFromNow(3), createdAt: daysAgo(25) },
    { title: 'Landing page redesign', description: 'New hero section with product screenshots', priority: 'high', status: 'In Progress', labels: ['Design', 'Frontend'], dueDate: daysAgo(1), createdAt: daysAgo(35) },
    { title: 'A/B test signup flow', description: 'Test single-step vs multi-step registration', priority: 'low', status: 'In Progress', labels: ['Engineering'], createdAt: daysAgo(42) },
    { title: 'Competitor research', description: 'Analyze top 5 competitors pricing and features', priority: 'low', status: 'Done', labels: ['Research'], createdAt: daysAgo(60) },
    { title: 'Define launch timeline', description: 'Create Gantt chart with milestones', priority: 'high', status: 'Done', labels: ['Planning'], createdAt: daysAgo(75) },
    { title: 'Brand guidelines doc', description: 'Finalize colors, fonts, and logo usage rules', priority: 'medium', status: 'Done', labels: ['Design'], createdAt: daysAgo(90) },
    { title: 'Secure launch day press coverage', description: 'Reach out to TechCrunch and The Verge', priority: 'high', status: 'Done', labels: ['Marketing'], createdAt: daysAgo(105) },
    { title: 'Set up customer support channels', description: 'Intercom chat widget and help center articles', priority: 'medium', status: 'Done', labels: ['Support'], createdAt: daysAgo(130) },
  ]);

  // --- 2. Engineering Sprint ---
  total += await createBoard(user._id, 'Engineering Sprint', ['Backlog', 'In Progress', 'Review', 'Done'], [
    { title: 'Migrate to PostgreSQL', description: 'Replace SQLite with Postgres for production readiness', priority: 'high', status: 'Backlog', labels: ['Backend', 'Database'], dueDate: daysFromNow(14), createdAt: daysAgo(3) },
    { title: 'Add rate limiting', description: 'Implement express-rate-limit on auth endpoints', priority: 'high', status: 'Backlog', labels: ['Backend', 'Security'], dueDate: daysFromNow(7), createdAt: daysAgo(7) },
    { title: 'Refactor user service', description: 'Extract business logic from controllers', priority: 'medium', status: 'Backlog', labels: ['Backend', 'Refactor'], createdAt: daysAgo(14) },
    { title: 'Write E2E tests', description: 'Cypress tests for auth flow and board CRUD', priority: 'low', status: 'Backlog', labels: ['Testing'], createdAt: daysAgo(20) },
    { title: 'Implement WebSocket notifications', description: 'Real-time updates when tasks change', priority: 'medium', status: 'Backlog', labels: ['Backend', 'Feature'], createdAt: daysAgo(28) },
    { title: 'Add file upload support', description: 'S3 integration for task attachments', priority: 'low', status: 'Backlog', labels: ['Backend', 'Feature'], createdAt: daysAgo(33) },
    { title: 'API pagination', description: 'Add cursor-based pagination to GET /tasks', priority: 'medium', status: 'In Progress', labels: ['Backend'], dueDate: daysFromNow(2), createdAt: daysAgo(10) },
    { title: 'Docker setup', description: 'Create Dockerfile and docker-compose for local dev', priority: 'high', status: 'In Progress', labels: ['DevOps'], dueDate: daysFromNow(0), createdAt: daysAgo(22) },
    { title: 'Implement search API', description: 'Full-text search with MongoDB Atlas Search', priority: 'medium', status: 'In Progress', labels: ['Backend', 'Feature'], createdAt: daysAgo(26) },
    { title: 'Fix CORS issue on Safari', description: 'Credentials not being sent on cross-origin requests', priority: 'high', status: 'Review', labels: ['Bug', 'Urgent'], dueDate: daysAgo(2), createdAt: daysAgo(30) },
    { title: 'Add input validation', description: 'Joi schemas for all POST/PUT endpoints', priority: 'medium', status: 'Review', labels: ['Backend', 'Security'], createdAt: daysAgo(40) },
    { title: 'Optimize board query', description: 'Reduce N+1 queries with populate and lean', priority: 'high', status: 'Review', labels: ['Backend', 'Performance'], createdAt: daysAgo(48) },
    { title: 'Set up CI pipeline', description: 'GitHub Actions for lint, test, and deploy', priority: 'high', status: 'Done', labels: ['DevOps'], createdAt: daysAgo(55) },
    { title: 'JWT refresh tokens', description: 'Implement token rotation with refresh endpoint', priority: 'high', status: 'Done', labels: ['Backend', 'Security'], createdAt: daysAgo(70) },
    { title: 'Database indexing', description: 'Add compound indexes on boardId + status', priority: 'medium', status: 'Done', labels: ['Database', 'Performance'], createdAt: daysAgo(85) },
    { title: 'Error handling middleware', description: 'Centralized error handler with proper status codes', priority: 'low', status: 'Done', labels: ['Backend'], createdAt: daysAgo(100) },
    { title: 'Logging with Winston', description: 'Structured JSON logging with log levels', priority: 'low', status: 'Done', labels: ['Backend'], createdAt: daysAgo(115) },
    { title: 'Health check endpoint', description: 'GET /health with DB connectivity status', priority: 'low', status: 'Done', labels: ['Backend', 'DevOps'], createdAt: daysAgo(140) },
  ]);

  // --- 3. Personal Goals ---
  total += await createBoard(user._id, 'Personal Goals', ['Todo', 'In Progress', 'Done'], [
    { title: 'Read "Designing Data-Intensive Applications"', description: 'Finish chapters 5-9 on replication and partitioning', priority: 'medium', status: 'Todo', createdAt: daysAgo(4) },
    { title: 'Complete AWS Solutions Architect cert', description: 'Finish practice exams and schedule test date', priority: 'high', status: 'Todo', createdAt: daysAgo(15) },
    { title: 'Build a CLI tool in Rust', description: 'File search utility to learn ownership and borrowing', priority: 'low', status: 'Todo', createdAt: daysAgo(30) },
    { title: 'Contribute to open source', description: 'Find good first issues on dnd-kit or Zustand repos', priority: 'low', status: 'Todo', createdAt: daysAgo(45) },
    { title: 'Start a tech blog', description: 'Write first 3 posts on system design topics', priority: 'medium', status: 'Todo', createdAt: daysAgo(52) },
    { title: 'Learn Kubernetes basics', description: 'Deploy a multi-container app on minikube', priority: 'medium', status: 'In Progress', createdAt: daysAgo(38) },
    { title: 'Rebuild portfolio site', description: 'Next.js 14 with MDX blog and project showcase', priority: 'medium', status: 'In Progress', createdAt: daysAgo(50) },
    { title: 'Learn Go concurrency', description: 'Goroutines, channels, and the sync package', priority: 'medium', status: 'In Progress', createdAt: daysAgo(58) },
    { title: 'Complete TypeScript deep dive', description: 'Generics, conditional types, and mapped types', priority: 'high', status: 'Done', createdAt: daysAgo(65) },
    { title: 'Finish React patterns course', description: 'Compound components, render props, and hooks patterns', priority: 'medium', status: 'Done', createdAt: daysAgo(80) },
    { title: 'Set up Neovim config', description: 'LSP, Telescope, and Treesitter from scratch', priority: 'low', status: 'Done', createdAt: daysAgo(110) },
    { title: 'Run a half marathon', description: 'Follow 12-week training plan', priority: 'high', status: 'Done', createdAt: daysAgo(120) },
    { title: 'Read "Clean Architecture"', description: 'Uncle Bob\'s guide to software structure', priority: 'medium', status: 'Done', createdAt: daysAgo(150) },
  ]);

  // --- 4. Design System ---
  total += await createBoard(user._id, 'Design System', ['Todo', 'In Progress', 'QA', 'Done'], [
    { title: 'Create color token system', description: 'Define semantic color tokens for light and dark themes', priority: 'high', status: 'Todo', createdAt: daysAgo(1) },
    { title: 'Build tooltip component', description: 'Accessible tooltip with arrow positioning', priority: 'medium', status: 'Todo', createdAt: daysAgo(6) },
    { title: 'Design date picker', description: 'Calendar dropdown with range selection support', priority: 'medium', status: 'Todo', createdAt: daysAgo(11) },
    { title: 'Create icon library', description: 'SVG sprite sheet with 48 common UI icons', priority: 'low', status: 'Todo', createdAt: daysAgo(19) },
    { title: 'Build dropdown menu', description: 'Keyboard navigable with submenus and dividers', priority: 'high', status: 'In Progress', createdAt: daysAgo(24) },
    { title: 'Implement toast system', description: 'Stacking toasts with auto-dismiss and actions', priority: 'medium', status: 'In Progress', createdAt: daysAgo(32) },
    { title: 'Build data table component', description: 'Sortable columns, pagination, and row selection', priority: 'high', status: 'In Progress', createdAt: daysAgo(44) },
    { title: 'Accessibility audit on modal', description: 'Focus trap, aria labels, and screen reader testing', priority: 'high', status: 'QA', createdAt: daysAgo(50) },
    { title: 'Test button variants', description: 'Visual regression tests for all button states', priority: 'medium', status: 'QA', createdAt: daysAgo(62) },
    { title: 'Typography scale', description: 'Define font sizes, weights, and line heights', priority: 'high', status: 'Done', createdAt: daysAgo(78) },
    { title: 'Spacing and layout tokens', description: '4px grid system with named spacing values', priority: 'medium', status: 'Done', createdAt: daysAgo(95) },
    { title: 'Button component', description: 'Primary, secondary, ghost, and danger variants', priority: 'high', status: 'Done', createdAt: daysAgo(112) },
    { title: 'Input component', description: 'Text, email, password with validation states', priority: 'high', status: 'Done', createdAt: daysAgo(125) },
    { title: 'Modal component', description: 'Animated overlay with focus management', priority: 'medium', status: 'Done', createdAt: daysAgo(145) },
    { title: 'Storybook setup', description: 'Configure Storybook 7 with autodocs and dark mode', priority: 'low', status: 'Done', createdAt: daysAgo(165) },
  ]);

  // --- 5. Mobile App ---
  total += await createBoard(user._id, 'Mobile App', ['Backlog', 'Sprint', 'Testing', 'Released'], [
    { title: 'Biometric authentication', description: 'Face ID and fingerprint login on iOS and Android', priority: 'high', status: 'Backlog', createdAt: daysAgo(2) },
    { title: 'Offline mode', description: 'Cache boards and tasks locally with sync on reconnect', priority: 'high', status: 'Backlog', createdAt: daysAgo(9) },
    { title: 'Push notifications', description: 'Firebase Cloud Messaging for task reminders', priority: 'medium', status: 'Backlog', createdAt: daysAgo(17) },
    { title: 'Dark mode support', description: 'System-aware theme switching with manual override', priority: 'low', status: 'Backlog', createdAt: daysAgo(23) },
    { title: 'Gesture-based task management', description: 'Swipe to complete, long press to edit', priority: 'medium', status: 'Backlog', createdAt: daysAgo(31) },
    { title: 'Implement bottom tab navigation', description: 'Boards, Search, Profile tabs with animations', priority: 'high', status: 'Sprint', createdAt: daysAgo(36) },
    { title: 'Build task detail screen', description: 'Full task view with edit form and delete action', priority: 'high', status: 'Sprint', createdAt: daysAgo(43) },
    { title: 'Integrate REST API', description: 'Axios client with token refresh and error handling', priority: 'high', status: 'Sprint', createdAt: daysAgo(51) },
    { title: 'Fix Android keyboard overlap', description: 'KeyboardAvoidingView not working on Samsung devices', priority: 'high', status: 'Testing', createdAt: daysAgo(57) },
    { title: 'Test on iOS 17', description: 'Verify all screens on iPhone 15 simulator', priority: 'medium', status: 'Testing', createdAt: daysAgo(66) },
    { title: 'App icon and splash screen', description: 'Adaptive icon for Android, asset catalog for iOS', priority: 'low', status: 'Released', createdAt: daysAgo(82) },
    { title: 'React Native project setup', description: 'Expo managed workflow with TypeScript template', priority: 'high', status: 'Released', createdAt: daysAgo(100) },
    { title: 'Navigation architecture', description: 'React Navigation v6 with typed routes', priority: 'high', status: 'Released', createdAt: daysAgo(120) },
    { title: 'Auth screens', description: 'Login and register with form validation', priority: 'high', status: 'Released', createdAt: daysAgo(135) },
    { title: 'Board list screen', description: 'FlatList with pull-to-refresh and empty state', priority: 'medium', status: 'Released', createdAt: daysAgo(155) },
  ]);

  // --- 6. DevOps & Infrastructure ---
  total += await createBoard(user._id, 'DevOps & Infrastructure', ['Todo', 'In Progress', 'Done'], [
    { title: 'Set up staging environment', description: 'Mirror production on AWS with separate RDS instance', priority: 'high', status: 'Todo', createdAt: daysAgo(1) },
    { title: 'Implement blue-green deployments', description: 'Zero-downtime deploys with ALB target group switching', priority: 'high', status: 'Todo', createdAt: daysAgo(8) },
    { title: 'Set up log aggregation', description: 'ELK stack or CloudWatch Logs Insights', priority: 'medium', status: 'Todo', createdAt: daysAgo(13) },
    { title: 'Database backup automation', description: 'Daily snapshots with 30-day retention policy', priority: 'high', status: 'Todo', createdAt: daysAgo(21) },
    { title: 'CDN configuration', description: 'CloudFront distribution for static assets', priority: 'medium', status: 'Todo', createdAt: daysAgo(29) },
    { title: 'Terraform state management', description: 'Migrate to S3 backend with DynamoDB locking', priority: 'high', status: 'In Progress', createdAt: daysAgo(37) },
    { title: 'Kubernetes cluster setup', description: 'EKS cluster with managed node groups', priority: 'high', status: 'In Progress', createdAt: daysAgo(46) },
    { title: 'Monitoring dashboards', description: 'Grafana dashboards for API latency and error rates', priority: 'medium', status: 'In Progress', createdAt: daysAgo(54) },
    { title: 'SSL certificate automation', description: 'ACM with auto-renewal for all domains', priority: 'medium', status: 'Done', createdAt: daysAgo(72) },
    { title: 'Docker image optimization', description: 'Multi-stage builds, reduced from 1.2GB to 180MB', priority: 'medium', status: 'Done', createdAt: daysAgo(88) },
    { title: 'Terraform modules for VPC', description: 'Reusable module with public/private subnets and NAT', priority: 'high', status: 'Done', createdAt: daysAgo(108) },
    { title: 'GitHub Actions CI/CD', description: 'Build, test, push to ECR, deploy to ECS', priority: 'high', status: 'Done', createdAt: daysAgo(130) },
    { title: 'Secrets management', description: 'AWS Secrets Manager integration with rotation', priority: 'high', status: 'Done', createdAt: daysAgo(160) },
    { title: 'Initial AWS account setup', description: 'Organizations, IAM roles, and billing alerts', priority: 'high', status: 'Done', createdAt: daysAgo(180) },
  ]);

  // --- 7. Q3 Marketing ---
  total += await createBoard(user._id, 'Q3 Marketing', ['Ideas', 'Planned', 'In Progress', 'Published'], [
    { title: 'Case study: Enterprise client', description: 'Interview and write up how Acme Corp uses the product', priority: 'high', status: 'Ideas', createdAt: daysAgo(3) },
    { title: 'Podcast guest appearance', description: 'Pitch to Software Engineering Daily and Changelog', priority: 'low', status: 'Ideas', createdAt: daysAgo(10) },
    { title: 'Webinar on productivity', description: '45-min live session with Q&A on kanban workflows', priority: 'medium', status: 'Ideas', createdAt: daysAgo(18) },
    { title: 'Referral program launch', description: 'Give $10 credit for each referred signup', priority: 'medium', status: 'Ideas', createdAt: daysAgo(27) },
    { title: 'SEO audit and optimization', description: 'Fix meta tags, add structured data, improve Core Web Vitals', priority: 'high', status: 'Planned', createdAt: daysAgo(34) },
    { title: 'Blog post: "10 Kanban Tips"', description: 'Listicle targeting long-tail productivity keywords', priority: 'medium', status: 'Planned', createdAt: daysAgo(41) },
    { title: 'Partner integration blog', description: 'Co-marketing post with Slack integration announcement', priority: 'medium', status: 'Planned', createdAt: daysAgo(49) },
    { title: 'Product Hunt launch prep', description: 'Assets, tagline, maker comment, and hunter outreach', priority: 'high', status: 'In Progress', createdAt: daysAgo(56) },
    { title: 'Email newsletter redesign', description: 'New template with product tips and community highlights', priority: 'medium', status: 'In Progress', createdAt: daysAgo(64) },
    { title: 'YouTube tutorial series', description: 'Record 5 short videos on core features', priority: 'medium', status: 'In Progress', createdAt: daysAgo(73) },
    { title: 'Comparison landing pages', description: 'vs Trello, vs Asana, vs Notion — SEO-optimized', priority: 'high', status: 'Published', createdAt: daysAgo(90) },
    { title: 'Blog post: "Why We Built This"', description: 'Founder story and product vision', priority: 'medium', status: 'Published', createdAt: daysAgo(110) },
    { title: 'Twitter/X content calendar', description: '30 days of scheduled tweets with engagement hooks', priority: 'low', status: 'Published', createdAt: daysAgo(128) },
    { title: 'Launch announcement email', description: 'Sent to 2,400 waitlist subscribers', priority: 'high', status: 'Published', createdAt: daysAgo(150) },
    { title: 'Brand voice guidelines', description: 'Tone, vocabulary, and example copy for all channels', priority: 'medium', status: 'Published', createdAt: daysAgo(170) },
  ]);

  console.log('Seed complete!');
  console.log(`7 boards, ${total} tasks (spanning ~6 months)`);
  console.log('Login: demo@example.com / password123');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  mongoose.disconnect();
  process.exit(1);
});
