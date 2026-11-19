create table if not exists public.lecture_chapters (
  id text primary key,
  class_level int not null check (class_level in (11, 12)),
  subject text not null check (subject in ('Physics','Chemistry','Mathematics','Biology')),
  name text not null,
  sort_order int not null default 0
);

create table if not exists public.lecture_items (
  id text primary key,
  chapter_id text not null references public.lecture_chapters(id) on delete cascade,
  title text not null,
  description text,
  duration text,
  telegram_post_url text,
  video_url text,
  sort_order int not null default 0
);

create table if not exists public.lecture_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lecture_id text not null references public.lecture_items(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lecture_id)
);

create index if not exists lecture_chapters_class_subject_order_idx
  on public.lecture_chapters (class_level, subject, sort_order);
create index if not exists lecture_items_chapter_order_idx
  on public.lecture_items (chapter_id, sort_order);

alter table public.lecture_chapters enable row level security;
alter table public.lecture_items enable row level security;
alter table public.lecture_progress enable row level security;

drop policy if exists "Public can read lecture chapters" on public.lecture_chapters;
create policy "Public can read lecture chapters" on public.lecture_chapters
  for select using (true);

drop policy if exists "Public can read lecture items" on public.lecture_items;
create policy "Public can read lecture items" on public.lecture_items
  for select using (true);

drop policy if exists "Users read their own progress" on public.lecture_progress;
create policy "Users read their own progress" on public.lecture_progress
  for select using (auth.uid() = user_id);

drop policy if exists "Users insert their own progress" on public.lecture_progress;
create policy "Users insert their own progress" on public.lecture_progress
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users delete their own progress" on public.lecture_progress;
create policy "Users delete their own progress" on public.lecture_progress
  for delete using (auth.uid() = user_id);

-- Lecture catalog writes are intentionally not public. Seed/update this content
-- through a protected server, Supabase dashboard, or an admin-only Edge Function.

-- Seed the supplied chapter structure. Lecture rows can be added with the admin import flow/server.
insert into public.lecture_chapters (id, class_level, subject, name, sort_order) values
  ('c11-physics-01', 11, 'Physics', 'Units and Measurements', 1),
  ('c11-physics-02', 11, 'Physics', 'Motion in a Straight Line', 2),
  ('c11-physics-03', 11, 'Physics', 'Motion in a Plane', 3),
  ('c11-physics-04', 11, 'Physics', 'Laws of Motion', 4),
  ('c11-physics-05', 11, 'Physics', 'Work, Energy and Power', 5),
  ('c11-physics-06', 11, 'Physics', 'System of Particles and Rotational Motion', 6),
  ('c11-physics-07', 11, 'Physics', 'Gravitation', 7),
  ('c11-physics-08', 11, 'Physics', 'Mechanical Properties of Solids', 8),
  ('c11-physics-09', 11, 'Physics', 'Mechanical Properties of Fluids', 9),
  ('c11-physics-10', 11, 'Physics', 'Thermal Properties of Matter', 10),
  ('c11-physics-11', 11, 'Physics', 'Thermodynamics', 11),
  ('c11-physics-12', 11, 'Physics', 'Kinetic Theory', 12),
  ('c11-physics-13', 11, 'Physics', 'Oscillations', 13),
  ('c11-physics-14', 11, 'Physics', 'Waves', 14),
  ('c11-chemistry-01', 11, 'Chemistry', 'Some Basic Concepts of Chemistry', 1),
  ('c11-chemistry-02', 11, 'Chemistry', 'Structure of Atom', 2),
  ('c11-chemistry-03', 11, 'Chemistry', 'Classification of Elements and Periodicity', 3),
  ('c11-chemistry-04', 11, 'Chemistry', 'Chemical Bonding and Molecular Structure', 4),
  ('c11-chemistry-05', 11, 'Chemistry', 'Chemical Thermodynamics', 5),
  ('c11-chemistry-06', 11, 'Chemistry', 'Equilibrium', 6),
  ('c11-chemistry-07', 11, 'Chemistry', 'Redox Reactions', 7),
  ('c11-chemistry-08', 11, 'Chemistry', 'Organic Chemistry: Basic Principles and Techniques', 8),
  ('c11-chemistry-09', 11, 'Chemistry', 'Hydrocarbons', 9),
  ('c11-mathematics-01', 11, 'Mathematics', 'Sets', 1),
  ('c11-mathematics-02', 11, 'Mathematics', 'Relations and Functions', 2),
  ('c11-mathematics-03', 11, 'Mathematics', 'Trigonometric Functions', 3),
  ('c11-mathematics-04', 11, 'Mathematics', 'Complex Numbers and Quadratic Equations', 4),
  ('c11-mathematics-05', 11, 'Mathematics', 'Linear Inequalities', 5),
  ('c11-mathematics-06', 11, 'Mathematics', 'Permutations and Combinations', 6),
  ('c11-mathematics-07', 11, 'Mathematics', 'Binomial Theorem', 7),
  ('c11-mathematics-08', 11, 'Mathematics', 'Sequences and Series', 8),
  ('c11-mathematics-09', 11, 'Mathematics', 'Straight Lines', 9),
  ('c11-mathematics-10', 11, 'Mathematics', 'Conic Sections', 10),
  ('c11-mathematics-11', 11, 'Mathematics', 'Introduction to Three Dimensional Geometry', 11),
  ('c11-mathematics-12', 11, 'Mathematics', 'Limits and Derivatives', 12),
  ('c11-mathematics-13', 11, 'Mathematics', 'Statistics', 13),
  ('c11-mathematics-14', 11, 'Mathematics', 'Probability', 14),
  ('c11-biology-01', 11, 'Biology', 'The Living World', 1),
  ('c11-biology-02', 11, 'Biology', 'Biological Classification', 2),
  ('c11-biology-03', 11, 'Biology', 'Plant Kingdom', 3),
  ('c11-biology-04', 11, 'Biology', 'Animal Kingdom', 4),
  ('c11-biology-05', 11, 'Biology', 'Morphology of Flowering Plants', 5),
  ('c11-biology-06', 11, 'Biology', 'Anatomy of Flowering Plants', 6),
  ('c11-biology-07', 11, 'Biology', 'Structural Organisation in Animals', 7),
  ('c11-biology-08', 11, 'Biology', 'Cell: The Unit of Life', 8),
  ('c11-biology-09', 11, 'Biology', 'Biomolecules', 9),
  ('c11-biology-10', 11, 'Biology', 'Cell Cycle and Cell Division', 10),
  ('c11-biology-11', 11, 'Biology', 'Photosynthesis in Higher Plants', 11),
  ('c11-biology-12', 11, 'Biology', 'Respiration in Plants', 12),
  ('c11-biology-13', 11, 'Biology', 'Plant Growth and Development', 13),
  ('c11-biology-14', 11, 'Biology', 'Breathing and Exchange of Gases', 14),
  ('c11-biology-15', 11, 'Biology', 'Body Fluids and Circulation', 15),
  ('c11-biology-16', 11, 'Biology', 'Excretory Products and their Elimination', 16),
  ('c11-biology-17', 11, 'Biology', 'Locomotion and Movement', 17),
  ('c11-biology-18', 11, 'Biology', 'Neural Control and Coordination', 18),
  ('c11-biology-19', 11, 'Biology', 'Chemical Coordination and Integration', 19),
  ('c12-physics-01', 12, 'Physics', 'Electric Charges and Fields', 1),
  ('c12-physics-02', 12, 'Physics', 'Electrostatic Potential and Capacitance', 2),
  ('c12-physics-03', 12, 'Physics', 'Current Electricity', 3),
  ('c12-physics-04', 12, 'Physics', 'Moving Charges and Magnetism', 4),
  ('c12-physics-05', 12, 'Physics', 'Magnetism and Matter', 5),
  ('c12-physics-06', 12, 'Physics', 'Electromagnetic Induction', 6),
  ('c12-physics-07', 12, 'Physics', 'Alternating Current', 7),
  ('c12-physics-08', 12, 'Physics', 'Electromagnetic Waves', 8),
  ('c12-physics-09', 12, 'Physics', 'Ray Optics and Optical Instruments', 9),
  ('c12-physics-10', 12, 'Physics', 'Wave Optics', 10),
  ('c12-physics-11', 12, 'Physics', 'Dual Nature of Radiation and Matter', 11),
  ('c12-physics-12', 12, 'Physics', 'Atoms', 12),
  ('c12-physics-13', 12, 'Physics', 'Nuclei', 13),
  ('c12-physics-14', 12, 'Physics', 'Semiconductor Electronics', 14),
  ('c12-chemistry-01', 12, 'Chemistry', 'Solutions', 1),
  ('c12-chemistry-02', 12, 'Chemistry', 'Electrochemistry', 2),
  ('c12-chemistry-03', 12, 'Chemistry', 'Chemical Kinetics', 3),
  ('c12-chemistry-04', 12, 'Chemistry', 'The d- and f-Block Elements', 4),
  ('c12-chemistry-05', 12, 'Chemistry', 'Coordination Compounds', 5),
  ('c12-chemistry-06', 12, 'Chemistry', 'Haloalkanes and Haloarenes', 6),
  ('c12-chemistry-07', 12, 'Chemistry', 'Alcohols, Phenols and Ethers', 7),
  ('c12-chemistry-08', 12, 'Chemistry', 'Aldehydes, Ketones and Carboxylic Acids', 8),
  ('c12-chemistry-09', 12, 'Chemistry', 'Amines', 9),
  ('c12-chemistry-10', 12, 'Chemistry', 'Biomolecules', 10),
  ('c12-mathematics-01', 12, 'Mathematics', 'Relations and Functions', 1),
  ('c12-mathematics-02', 12, 'Mathematics', 'Inverse Trigonometric Functions', 2),
  ('c12-mathematics-03', 12, 'Mathematics', 'Matrices', 3),
  ('c12-mathematics-04', 12, 'Mathematics', 'Determinants', 4),
  ('c12-mathematics-05', 12, 'Mathematics', 'Continuity and Differentiability', 5),
  ('c12-mathematics-06', 12, 'Mathematics', 'Application of Derivatives', 6),
  ('c12-mathematics-07', 12, 'Mathematics', 'Integrals', 7),
  ('c12-mathematics-08', 12, 'Mathematics', 'Application of Integrals', 8),
  ('c12-mathematics-09', 12, 'Mathematics', 'Differential Equations', 9),
  ('c12-mathematics-10', 12, 'Mathematics', 'Vector Algebra', 10),
  ('c12-mathematics-11', 12, 'Mathematics', 'Three Dimensional Geometry', 11),
  ('c12-mathematics-12', 12, 'Mathematics', 'Linear Programming', 12),
  ('c12-mathematics-13', 12, 'Mathematics', 'Probability', 13),
  ('c12-biology-01', 12, 'Biology', 'Sexual Reproduction in Flowering Plants', 1),
  ('c12-biology-02', 12, 'Biology', 'Human Reproduction', 2),
  ('c12-biology-03', 12, 'Biology', 'Reproductive Health', 3),
  ('c12-biology-04', 12, 'Biology', 'Principles of Inheritance and Variation', 4),
  ('c12-biology-05', 12, 'Biology', 'Molecular Basis of Inheritance', 5),
  ('c12-biology-06', 12, 'Biology', 'Evolution', 6),
  ('c12-biology-07', 12, 'Biology', 'Human Health and Disease', 7),
  ('c12-biology-08', 12, 'Biology', 'Microbes in Human Welfare', 8),
  ('c12-biology-09', 12, 'Biology', 'Biotechnology: Principles and Processes', 9),
  ('c12-biology-10', 12, 'Biology', 'Biotechnology and its Applications', 10),
  ('c12-biology-11', 12, 'Biology', 'Organisms and Populations', 11),
  ('c12-biology-12', 12, 'Biology', 'Ecosystem', 12),
  ('c12-biology-13', 12, 'Biology', 'Biodiversity and Conservation', 13)
on conflict (id) do update set class_level=excluded.class_level, subject=excluded.subject, name=excluded.name, sort_order=excluded.sort_order;
