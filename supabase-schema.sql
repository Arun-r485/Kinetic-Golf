-- Run this in Supabase SQL Editor before starting the server
-- Go to: Supabase Dashboard > SQL Editor > New Query > Paste > Run

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text DEFAULT 'subscriber',
  subscription_status text DEFAULT 'inactive',
  subscription_plan text,
  subscription_renewal_date timestamptz,
  charity_id uuid,
  charity_contribution_percent integer DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE charities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  images text[],
  upcoming_events jsonb,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  plan text,
  razorpay_order_id text,
  razorpay_payment_id text,
  status text,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE golf_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  score integer CHECK (score >= 1 AND score <= 45),
  date_played date NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE draws (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month integer,
  year integer,
  drawn_numbers integer[],
  type text,
  status text DEFAULT 'simulation',
  jackpot_rollover boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE draw_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  draw_id uuid REFERENCES draws(id),
  scores integer[],
  match_type text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  draw_id uuid REFERENCES draws(id),
  match_type text,
  prize_amount numeric,
  payment_status text DEFAULT 'pending',
  proof_url text,
  verification_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Additional tables identified from Mongoose models
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  razorpay_order_id text NOT NULL,
  razorpay_payment_id text,
  amount numeric NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  score integer NOT NULL,
  points integer DEFAULT 0,
  course text,
  date timestamptz DEFAULT now(),
  hole_scores integer[],
  hole_pars integer[]
);


-- Indexes on user_id for golf_scores, subscriptions, draw_entries, winners (and additional tables)
CREATE INDEX idx_golf_scores_user_id ON golf_scores(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_draw_entries_user_id ON draw_entries(user_id);
CREATE INDEX idx_winners_user_id ON winners(user_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_scores_user_id ON scores(user_id);

-- Indexes on draw_id for draw_entries, winners
CREATE INDEX idx_draw_entries_draw_id ON draw_entries(draw_id);
CREATE INDEX idx_winners_draw_id ON winners(draw_id);

-- Indexes on status for draws, winners, subscriptions
CREATE INDEX idx_draws_status ON draws(status);
CREATE INDEX idx_winners_verification_status ON winners(verification_status);
CREATE INDEX idx_winners_payment_status ON winners(payment_status);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_payments_status ON payments(status);
