alter table if exists public.users
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists terms_version varchar(32),
  add column if not exists privacy_version varchar(32),
  add column if not exists model_training_consent boolean not null default false;

comment on column public.users.terms_accepted_at is
  'UTC time when the user explicitly accepted the governing policies.';
comment on column public.users.terms_version is
  'Terms of Service version accepted by the user.';
comment on column public.users.privacy_version is
  'Privacy Policy version accepted by the user.';
comment on column public.users.model_training_consent is
  'Whether the user accepted disclosed use of submitted information for future model training and evaluation.';
